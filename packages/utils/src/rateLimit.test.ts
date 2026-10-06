import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { consumeRateLimit, resetRateLimitState } from "./rateLimit";

describe("consumeRateLimit", () => {
  beforeEach(() => resetRateLimitState());
  const opts = { limit: 3, windowMs: 1000 };

  it("allows up to the limit then blocks with a Retry-After", () => {
    for (let i = 0; i < 3; i++) assert.equal(consumeRateLimit("k", opts, 0).allowed, true);
    const blocked = consumeRateLimit("k", opts, 10);
    assert.equal(blocked.allowed, false);
    assert.equal(blocked.retryAfterSeconds, 1);
  });

  it("resets after the window and isolates keys", () => {
    for (let i = 0; i < 3; i++) consumeRateLimit("a", opts, 0);
    assert.equal(consumeRateLimit("a", opts, 500).allowed, false);
    assert.equal(consumeRateLimit("b", opts, 500).allowed, true);
    assert.equal(consumeRateLimit("a", opts, 1001).allowed, true);
  });

  it("stays bounded under a key-flood (no unbounded memory growth)", () => {
    for (let i = 0; i < 25_000; i++) consumeRateLimit(`flood:${i}`, opts, 0);
    // internal cap is 10_000; a fresh key must still be accepted afterwards
    assert.equal(consumeRateLimit("after-flood", opts, 0).allowed, true);
  });
});

import { evaluateRateLimit, setRemoteLimiterFactory, windowToDuration } from "./rateLimit";

describe("windowToDuration", () => {
  it("formats Upstash duration strings", () => {
    assert.equal(windowToDuration(60_000), "60 s");
    assert.equal(windowToDuration(1000), "1 s");
    assert.equal(windowToDuration(1500), "1500 ms");
    assert.equal(windowToDuration(0), "1 ms");
  });
});

describe("evaluateRateLimit (remote backend + fallback)", () => {
  const opts = { limit: 2, windowMs: 1000 };
  beforeEach(() => { resetRateLimitState(); setRemoteLimiterFactory(() => null); });

  it("uses in-memory when no remote backend is configured", async () => {
    assert.equal((await evaluateRateLimit("u", "p", opts, 0)).allowed, true);
    assert.equal((await evaluateRateLimit("u", "p", opts, 0)).allowed, true);
    assert.equal((await evaluateRateLimit("u", "p", opts, 0)).allowed, false);
  });

  it("trusts the remote decision and maps Retry-After", async () => {
    setRemoteLimiterFactory(() => ({
      limit: async () => ({ success: false, limit: 2, remaining: 0, reset: 5000 }),
    }));
    const r = await evaluateRateLimit("u", "p", opts, 1000);
    assert.equal(r.allowed, false);
    assert.equal(r.retryAfterSeconds, 4);
  });

  it("falls back to in-memory when Redis throws (outage must not break checkout)", async () => {
    setRemoteLimiterFactory(() => ({ limit: async () => { throw new Error("redis down"); } }));
    const origError = console.error; console.error = () => {};
    try {
      assert.equal((await evaluateRateLimit("u", "p", opts, 0)).allowed, true);
      assert.equal((await evaluateRateLimit("u", "p", opts, 0)).allowed, true);
      assert.equal((await evaluateRateLimit("u", "p", opts, 0)).allowed, false); // still limited locally
    } finally { console.error = origError; }
  });

  it("falls back when Redis hangs past the timeout", async () => {
    setRemoteLimiterFactory(() => ({ limit: () => new Promise(() => {}) })); // never resolves
    const origError = console.error; console.error = () => {};
    try {
      assert.equal((await evaluateRateLimit("u", "p", opts, 0)).allowed, true);
    } finally { console.error = origError; }
  });
});
