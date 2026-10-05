import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { serializeJsonLd } from "./jsonLd";

describe("serializeJsonLd", () => {
  it("neutralises </script> breakout and still round-trips as JSON", () => {
    const evil = {
      "@type": "Product",
      name: `</script><script>alert(document.cookie)</script>`,
      description: "a & b > c \u2028 \u2029",
    };
    const out = serializeJsonLd(evil);
    assert.ok(!out.includes("<"), "no raw '<'");
    assert.ok(!out.includes(">"), "no raw '>'");
    assert.ok(!/<\/script/i.test(out));
    assert.deepEqual(JSON.parse(out), evil); // lossless for JSON-LD consumers
  });
});
