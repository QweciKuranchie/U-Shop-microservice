/**
 * Serialize data for embedding in a `<script type="application/ld+json">` tag.
 *
 * `JSON.stringify` alone is NOT safe inside an inline <script>: a string value
 * containing `</script>` terminates the tag and the remainder executes as HTML
 * (stored XSS — product names/descriptions are seller-controlled in a
 * multi-vendor marketplace). Escaping `<`, `>`, `&` and the JS line separators
 * keeps the output valid JSON (parsers decode \uXXXX) while making it inert.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
