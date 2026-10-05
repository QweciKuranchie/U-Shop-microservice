import { NextRequest, NextResponse } from "next/server";

/**
 * In-memory fixed-window rate limiter. SERVER ONLY — import from
 * "@repo/utils/rate-limit", never from the package barrel (it is intentionally
 * not re-exported there, so client bundles never pull in `next/server`).
 *
 * Limitations (by design, documented rather than hidden):
 *  - State is per server instance. On serverless/multi-instance deployments the
 *    effective limit is `limit × instances`. For hard guarantees on payment
 *    endpoints swap the store for Redis/Upstash behind the same API.
 *  - No module-level timers: expired entries are swept lazily, and the map is
 *    bounded, so there is no leaked interval (previously one per HMR reload /
 *    per client bundle) and no unbounded growth.
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
 * (Signature unchanged from the previous implementation.)
 */
export function checkRateLimit(
  req: NextRequest,
  prefix: string,
  options: RateLimitOptions
): NextResponse | null {
  const result = consumeRateLimit(`${prefix}:${getClientIp(req)}`, options);
  return result.allowed ? null : tooManyRequests(result);
}

/**
 * Per-identity limit (e.g. Clerk userId). Prefer this for authenticated
 * endpoints: many Ghanaian mobile users share carrier-grade NAT addresses, so
 * IP-only limits punish legitimate shoppers while doing little against a
 * determined attacker.
 */
export function checkRateLimitByKey(
  key: string,
  prefix: string,
  options: RateLimitOptions
): NextResponse | null {
  const result = consumeRateLimit(`${prefix}:${key}`, options);
  return result.allowed ? null : tooManyRequests(result);
}
