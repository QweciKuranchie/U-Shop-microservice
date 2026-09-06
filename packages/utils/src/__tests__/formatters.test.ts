import { describe, it, expect } from "vitest";
import { formatCurrency, formatDate } from "../formatters";

describe("Formatters Utility", () => {
  it("formats currency correctly in GHS", () => {
    const formatted = formatCurrency(150.5);
    expect(formatted).toContain("150.50");
  });

  it("formats dates safely", () => {
    const formatted = formatDate("2026-09-06T00:00:00Z");
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe("string");
  });
});
