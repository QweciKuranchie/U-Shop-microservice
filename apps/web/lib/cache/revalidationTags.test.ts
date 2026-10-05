import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { tagsForDocumentType } from "./revalidationTags";

describe("tagsForDocumentType", () => {
  it("maps cached document types to their tags", () => {
    assert.ok(tagsForDocumentType("product").includes("products"));
    assert.ok(tagsForDocumentType("category").includes("navigation"));
    assert.ok(tagsForDocumentType("brand").includes("brands"));
  });

  it("ignores uncached or hostile types", () => {
    for (const t of ["order", "user", "__proto__", "constructor", "", undefined, null, 5]) {
      assert.deepEqual(tagsForDocumentType(t), []);
    }
  });

  it("returns a copy (callers cannot mutate the registry)", () => {
    tagsForDocumentType("product").push("x");
    assert.ok(!tagsForDocumentType("product").includes("x"));
  });
});
