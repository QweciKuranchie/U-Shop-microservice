import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * In-memory fixed-window rate limiter. SERVER ONLY — import from
 * "@repo/utils/rate-limit", never from the package barrel (it is intentionally
 * not re-exported there, so client bundles never pull in `next/server`).
 *
 * Two backends behind one API:
 *  - Upstash Redis (sliding window) when UPSTASH_REDIS_REST_URL and
 *    UPSTASH_REDIS_REST_TOKEN are set: shared across every serverless instance,
 *    so the limit is real. Used in production.
 *  - In-memory fixed window otherwise (local dev) and as an automatic fallback
 *    if Redis errors or is slow. A Redis outage therefore degrades protection to
 *    per-instance limits instead of taking checkout down. Failures are logged.
 *
 * No module-level timers: expired in-memory entries are swept lazily and the map
 * is bounded, so there is no leaked interval and no unbounded growth.
 */

export interface RateLimitOptions {
  /** Maximum number of requests allowed within the window */
  limit: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfterSeconds: number;
}

const MAX_TRACKED_KEYS = 10_000;
const SWEEP_EVERY_N_CALLS = 500;

const tracker = new Map<string, RateLimitRecord>();
let callsSinceSweep = 0;

function sweep(now: number): void {
  for (const [key, record] of tracker) {
    if (now > record.resetTime) tracker.delete(key);
  }
}

/** Core, framework-free decision function (unit-testable). */
export function consumeRateLimit(
  key: string,
  options: RateLimitOptions,
  now: number = Date.now()
): RateLimitResult {
  if (++callsSinceSweep >= SWEEP_EVERY_N_CALLS || tracker.size >= MAX_TRACKED_KEYS) {
    callsSinceSweep = 0;
    sweep(now);
    // Still full of live entries: evict oldest-inserted to stay bounded.
    while (tracker.size >= MAX_TRACKED_KEYS) {
      const oldest = tracker.keys().next().value;
      if (oldest === undefined) break;
      tracker.delete(oldest);
    }
  }

  const record = tracker.get(key);
  if (!record || now > record.resetTime) {
    const resetTime = now + options.windowMs;
    tracker.set(key, { count: 1, resetTime });
    return {
      allowed: true,
      limit: options.limit,
      remaining: Math.max(0, options.limit - 1),
      resetTime,
      retryAfterSeconds: 0,
    };
  }

  if (record.count >= options.limit) {
    return {
      allowed: false,
      limit: options.limit,
      remaining: 0,
      resetTime: record.resetTime,
      retryAfterSeconds: Math.max(1, Math.ceil((record.resetTime - now) / 1000)),
    };
  }

  record.count += 1;
  return {
    allowed: true,
    limit: options.limit,
    remaining: options.limit - record.count,
    resetTime: record.resetTime,
    retryAfterSeconds: 0,
  };
}

/** Test helper. */
export function resetRateLimitState(): void {
  tracker.clear();
  callsSinceSweep = 0;
}

/**
 * Best-effort client IP that resists `X-Forwarded-For` spoofing.
 *
 * The LEFT-most XFF entry is client-controlled (any caller can send
 * `X-Forwarded-For: <random>` to get a fresh bucket every request). Each trusted
 * proxy appends the address it saw, so we read from the RIGHT, skipping
 * `TRUSTED_PROXY_HOPS` (default 1) entries. Platform headers that the edge
 * overwrites are preferred when present.
 */
export function getClientIp(req: NextRequest): string {
  for (const header of ["x-vercel-forwarded-for", "cf-connecting-ip", "x-real-ip"]) {
    const value = req.headers.get(header)?.trim();
    if (value) return value;
  }

  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length > 0) {
      const hops = Math.max(1, Number(process.env.TRUSTED_PROXY_HOPS ?? 1) || 1);
      return parts[Math.max(0, parts.length - hops)];
    }
  }
  return "unknown";
}

// ---------------------------------------------------------------------------
// Remote (Upstash) backend
// ---------------------------------------------------------------------------

const REMOTE_TIMEOUT_MS = 1500;

/** Minimal surface we need from the remote limiter (also what tests fake). */
export interface RemoteLimiter {
  limit(identifier: string): Promise<{ success: boolean; limit: number; remaining: number; reset: number }>;
}
export type RemoteLimiterFactory = (options: RateLimitOptions, prefix: string) => RemoteLimiter | null;

/** `60000` → `"60 s"`, `1500` → `"1500 ms"` (Upstash duration strings). */
export function windowToDuration(windowMs: number): `${number} s` | `${number} ms` {
  const ms = Math.max(1, Math.floor(windowMs));
  return ms % 1000 === 0 ? `${ms / 1000} s` : `${ms} ms`;
}

let redisClient: Redis | null | undefined;
const remoteLimiters = new Map<string, RemoteLimiter>();

const upstashFactory: RemoteLimiterFactory = (options, prefix) => {
  if (redisClient === undefined) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    redisClient = url && token ? new Redis({ url, token }) : null;
  }
  if (!redisClient) return null;

  // One Ratelimit instance per distinct (prefix, limit, window).
  const cacheKey = `${prefix}|${options.limit}|${options.windowMs}`;
  let limiter = remoteLimiters.get(cacheKey);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: redisClient,
      limiter: Ratelimit.slidingWindow(options.limit, windowToDuration(options.windowMs)),
      prefix: `ushop:rl:${prefix}`,
      analytics: false,
    });
    remoteLimiters.set(cacheKey, limiter);
  }
  return limiter;
};

let remoteFactory: RemoteLimiterFactory = upstashFactory;

/** Test seam: swap (or reset with no argument) the remote backend factory. */
export function setRemoteLimiterFactory(factory?: RemoteLimiterFactory): void {
  remoteFactory = factory ?? upstashFactory;
  remoteLimiters.clear();
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`rate limiter timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

/** Decide using Redis when available; fall back to in-memory on absence/error/timeout. */
export async function evaluateRateLimit(
  identifier: string,
  prefix: string,
  options: RateLimitOptions,
  now: number = Date.now()
): Promise<RateLimitResult> {
  const remote = remoteFactory(options, prefix);
  if (remote) {
    try {
      const r = await withTimeout(remote.limit(identifier), REMOTE_TIMEOUT_MS);
      return {
        allowed: r.success,
        limit: r.limit,
        remaining: r.remaining,
        resetTime: r.reset,
        retryAfterSeconds: r.success ? 0 : Math.max(1, Math.ceil((r.reset - now) / 1000)),
      };
    } catch (error) {
      console.error("[rate-limit] Redis unavailable, using in-memory fallback:", error);
    }
  }
  return consumeRateLimit(`${prefix}:${identifier}`, options, now);
}

function tooManyRequests(result: RateLimitResult): NextResponse {
  return NextResponse.json(
    {
      error: "Too many requests. Please try again later.",
      retryAfterSeconds: result.retryAfterSeconds,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(result.retryAfterSeconds),
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(Math.ceil(result.resetTime / 1000)),
      },
    }
  );
}

/**
 * Per-IP limit. Returns a 429 response if exceeded, otherwise null.
 * (Now async: callers must `await` it.)
 */
export async function checkRateLimit(
  req: NextRequest,
  prefix: string,
  options: RateLimitOptions
): Promise<NextResponse | null> {
  const result = await evaluateRateLimit(getClientIp(req), prefix, options);
  return result.allowed ? null : tooManyRequests(result);
}

/**
 * Per-identity limit (e.g. Clerk userId). Prefer this for authenticated
 * endpoints: many Ghanaian mobile users share carrier-grade NAT addresses, so
 * IP-only limits punish legitimate shoppers while doing little against a
 * determined attacker.
 */
export async function checkRateLimitByKey(
  key: string,
  prefix: string,
  options: RateLimitOptions
): Promise<NextResponse | null> {
  const result = await evaluateRateLimit(key, prefix, options);
  return result.allowed ? null : tooManyRequests(result);
}
