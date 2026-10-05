/**
 * Pure payment-integrity checks (no I/O) — unit-tested in isolation.
 *
 * A "successful" Paystack charge is only proof that SOME amount was paid. Before
 * an order may be marked paid we must prove the charge covers THIS order's total,
 * in the right currency. Previously neither the webhook nor the callback checked
 * the amount, so paying GHS 1 against a GHS 5,000 order would mark it paid.
 */

export interface ChargeSummary {
  status?: string | null;
  /** Smallest currency unit (pesewas for GHS), as returned by Paystack. */
  amount?: number | null;
  currency?: string | null;
}

export interface OrderPaymentSnapshot {
  totalPrice?: number | null;
  currency?: string | null;
}

export type ChargeCheckResult =
  | { ok: true; amountPesewas: number }
  | {
      ok: false;
      reason:
        | "charge_not_successful"
        | "invalid_order_total"
        | "currency_mismatch"
        | "amount_mismatch";
      expectedPesewas?: number;
      receivedPesewas?: number;
    };

/** GHS → pesewas; identical rounding to the amount sent to Paystack at init. */
export function toPesewas(amountGhs: number): number {
  return Math.round(amountGhs * 100);
}

export function verifyChargeAgainstOrder(
  order: OrderPaymentSnapshot,
  charge: ChargeSummary
): ChargeCheckResult {
  if (charge.status !== "success") {
    return { ok: false, reason: "charge_not_successful" };
  }

  const total = order.totalPrice;
  if (typeof total !== "number" || !Number.isFinite(total) || total <= 0) {
    return { ok: false, reason: "invalid_order_total" };
  }

  const expectedCurrency = (order.currency || "GHS").toUpperCase();
  if ((charge.currency || "").toUpperCase() !== expectedCurrency) {
    return { ok: false, reason: "currency_mismatch" };
  }

  const expectedPesewas = toPesewas(total);
  const receivedPesewas = charge.amount;
  if (
    typeof receivedPesewas !== "number" ||
    !Number.isInteger(receivedPesewas) ||
    receivedPesewas !== expectedPesewas
  ) {
    return {
      ok: false,
      reason: "amount_mismatch",
      expectedPesewas,
      receivedPesewas: typeof receivedPesewas === "number" ? receivedPesewas : undefined,
    };
  }

  return { ok: true, amountPesewas: receivedPesewas };
}
