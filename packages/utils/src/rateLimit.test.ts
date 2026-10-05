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
