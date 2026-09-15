import crypto from "crypto";

export const MOMO_PHONE_REGEX =
  /^(024|025|026|027|028|054|055|057|059)\d{7}$/;

/**
 * Validates Ghanaian Mobile Money phone number.
 * Must be exactly 10 digits starting with one of the allowed network prefixes:
 * 024, 025, 026, 027, 028, 054, 055, 057, 059
 */
export function validateMomoPhone(phone: string): boolean {
  if (!phone || typeof phone !== "string") {
    return false;
  }
  return MOMO_PHONE_REGEX.test(phone.trim());
}

/**
 * Converts Ghanaian Cedi (GHS) amount to pesewas (integer).
 * 1 GHS = 100 pesewas.
 */
export function ghsToPesewas(amount: number): number {
  if (typeof amount !== "number" || isNaN(amount) || amount < 0) {
    return 0;
  }
  return Math.round(amount * 100);
}

/**
 * Generates unique Paystack reference formatted as PSK-<orderNumber>-<timestamp>.
 */
export function generatePaystackReference(orderNumber: string): string {
  return `PSK-${orderNumber}-${Date.now()}`;
}

/**
 * Verifies Paystack HMAC-SHA512 webhook signature using constant-time comparison.
 */
export function verifyPaystackSignature(
  rawBody: string,
  signature: string | null,
  secretKey: string
): boolean {
  if (!signature || !secretKey || !rawBody) {
    return false;
  }
  const hash = crypto
    .createHmac("sha512", secretKey)
    .update(rawBody)
    .digest("hex");

  const sigBuffer = Buffer.from(signature, "hex");
  const hashBuffer = Buffer.from(hash, "hex");

  if (sigBuffer.length === 0 || sigBuffer.length !== hashBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(sigBuffer, hashBuffer);
}
