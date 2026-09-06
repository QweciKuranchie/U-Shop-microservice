import { describe, it } from "node:test";
import assert from "node:assert";
import { formatPrice, formatDate, truncate } from "../formatters";

describe("Formatters Utility", () => {
  it("formats price correctly in GHS", () => {
    const formatted = formatPrice(150.5);
    assert.strictEqual(typeof formatted, "string");
    assert.ok(formatted.includes("150.50") || formatted.includes("GH"));
  });

  it("formats dates safely", () => {
    const formatted = formatDate("2026-09-06T00:00:00Z");
    assert.strictEqual(typeof formatted, "string");
  });

  it("truncates text correctly", () => {
    const text = truncate("Hello World", 5);
    assert.strictEqual(text, "Hello...");
  });
});
