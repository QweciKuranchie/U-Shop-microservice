import { NextRequest, NextResponse } from "next/server";

interface RateLimitOptions {
  /** Maximum number of requests allowed within the window */
  limit: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const tracker = new Map<string, RateLimitRecord>();

// Cleanup expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of tracker.entries()) {
    if (now > record.resetTime) {
      tracker.delete(key);
    }
  }
}, 60000);

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}

/**
  Checks rate limit for a request based on IP address and key prefix.
  Returns NextResponse (429) if limit exceeded, or null if allowed.
 */
export function checkRateLimit(
  req: NextRequest,
  prefix: string,
  options: RateLimitOptions
): NextResponse | null {
  const ip = getClientIp(req);
  const key = `${prefix}:${ip}`;
  const now = Date.now();

  const record = tracker.get(key);

  if (!record || now > record.resetTime) {
    tracker.set(key, {
      count: 1,
      resetTime: now + options.windowMs,
    });
    return null;
  }

  if (record.count >= options.limit) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return NextResponse.json(
      {
        error: "Too many requests. Please try again later.",
        retryAfterSeconds: retryAfter,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
          "X-RateLimit-Limit": String(options.limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(record.resetTime / 1000)),
        },
      }
    );
  }

  record.count += 1;
  return null;
}
