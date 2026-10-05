/**
 * Guards for "PATCH with the request body" endpoints.
 *
 * `writeClient.patch(id).set(body)` with a client-supplied body is mass
 * assignment: the caller chooses WHICH fields to overwrite. Two details make a
 * naive check unsafe:
 *  - Sanity treats `set` keys as JSONPath, so `"store._ref"` or `"kycStatus"`
 *    inside brackets would bypass a top-level key comparison. We therefore
 *    compare the ROOT segment of every key.
 *  - Inherited keys (`__proto__`, `constructor`) must never be consulted.
 */

const SYSTEM_FIELDS = ["_id", "_type", "_rev", "_createdAt", "_updatedAt"] as const;

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** `"store._ref"` → `"store"`, `"items[0].qty"` → `"items"`. */
export function rootKey(key: string): string {
  return key.split(/[.[]/, 1)[0];
}

/** Keep only keys whose root segment is in `allowed`. Returns null if body is not an object. */
export function pickAllowedFields(
  body: unknown,
  allowed: readonly string[]
): Record<string, unknown> | null {
  if (!isPlainObject(body)) return null;
  const allow = new Set(allowed);
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body)) {
    if (allow.has(rootKey(key))) out[key] = value;
  }
  return out;
}

/** Drop system fields and `protectedKeys` (by root segment). Returns null if body is not an object. */
export function omitProtectedFields(
  body: unknown,
  protectedKeys: readonly string[]
): Record<string, unknown> | null {
  if (!isPlainObject(body)) return null;
  const blocked = new Set<string>([...SYSTEM_FIELDS, ...protectedKeys]);
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body)) {
    if (!blocked.has(rootKey(key))) out[key] = value;
  }
  return out;
}
