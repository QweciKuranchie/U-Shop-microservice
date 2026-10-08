import { randomUUID } from "node:crypto";
import { writeClient } from "@repo/sanity";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/orderStatus";
import { WALLET_USER_QUERY } from "./queries";

/**
 * Wallet mutations. SERVER-ONLY and deliberately NOT in a "use server" file.
 *
 * Every export of a "use server" module is a Server Action — a public HTTP
 * endpoint. `addWalletCredit(userId, amount, …)` used to live in one with no
 * auth check; it now lives here, where it can only be imported by server code.
 *
 * Concurrency model: optimistic locking. Each mutation reads the user document
 * (and its `_rev`), computes the new state, and commits with `ifRevisionId`. A
 * concurrent writer makes Sanity answer 409; we re-read and re-evaluate (so a
 * balance check is always made against the balance we actually write over).
 * Reads use `writeClient` (useCdn:false): money decisions must never be made on
 * CDN-cached data, which can lag the latest commit.
 */

export type WalletTransactionType =
  | "credit_refund"
  | "credit_manual"
  | "debit_order"
  | "debit_purchase"
  | "debit_withdrawal";

interface WalletTransaction {
  _key: string;
  id: string;
  type: WalletTransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  orderId?: string;
  processedBy?: string;
  createdAt: string;
  status: "completed";
}

interface WalletUser {
  _id: string;
  _rev: string;
  walletBalance?: number | null;
  alreadyCredited?: boolean;
}

export type WalletResult = {
  success: boolean;
  message: string;
  newBalance?: number;
  alreadyCredited?: boolean;
};

const MAX_ATTEMPTS = 4;
const round2 = (n: number) => Math.round(n * 100) / 100;
const isValidAmount = (n: unknown): n is number =>
  typeof n === "number" && Number.isFinite(n) && n > 0;
const isConflict = (e: unknown) =>
  typeof e === "object" && e !== null && (e as { statusCode?: number }).statusCode === 409;

function makeTransaction(
  fields: Omit<WalletTransaction, "_key" | "id" | "createdAt" | "status">
): WalletTransaction {
  const id = randomUUID();
  return { _key: id, id, createdAt: new Date().toISOString(), status: "completed", ...fields };
}

async function loadWalletUser(clerkUserId: string, refundOrderId?: string): Promise<WalletUser | null> {
  return writeClient.fetch<WalletUser | null>(
    WALLET_USER_QUERY,
    { clerkUserId, refundOrderId: refundOrderId ?? null }
  );
}

/**
 * Credit a refund. Idempotent per order: calling it again for the same order
 * (e.g. an admin retrying after the follow-up order update failed) reports
 * success WITHOUT crediting twice — closing the double-refund window that
 * existed when "credit wallet" and "mark order cancelled" were separate writes.
 */
export async function addWalletCredit(
  clerkUserId: string,
  amount: number,
  description: string,
  orderId?: string,
  processedBy?: string
): Promise<WalletResult> {
  if (!isValidAmount(amount)) return { success: false, message: "Invalid amount" };

  try {
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const user = await loadWalletUser(clerkUserId, orderId);
      if (!user) return { success: false, message: "User not found" };

      const current = user.walletBalance || 0;
      if (user.alreadyCredited) {
        return { success: true, message: "Refund already credited", newBalance: current, alreadyCredited: true };
      }

      const newBalance = round2(current + amount);
      const tx = makeTransaction({
        type: "credit_refund",
        amount: round2(amount),
        balanceBefore: current,
        balanceAfter: newBalance,
        description,
        orderId,
        processedBy,
      });

      try {
        await writeClient
          .patch(user._id)
          .ifRevisionId(user._rev)
          .set({ walletBalance: newBalance })
          .setIfMissing({ walletTransactions: [] })
          .insert("before", "walletTransactions[0]", [tx])
          .commit();
        return { success: true, message: "Credit added successfully", newBalance };
      } catch (error) {
        if (!isConflict(error)) throw error;
      }
    }
    return { success: false, message: "Wallet is busy, please retry" };
  } catch (error) {
    console.error("Error adding wallet credit:", error);
    return { success: false, message: "Failed to add credit to wallet" };
  }
}

/** Generic debit with a balance check made against the revision being overwritten. */
export async function debitWallet(
  clerkUserId: string,
  amount: number,
  orderId: string
): Promise<WalletResult> {
  // A non-positive amount would otherwise INCREASE the balance (current - (-x)).
  if (!isValidAmount(amount)) return { success: false, message: "Invalid amount" };

  try {
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const user = await loadWalletUser(clerkUserId);
      if (!user) return { success: false, message: "User not found" };

      const current = user.walletBalance || 0;
      if (current < amount) return { success: false, message: "Insufficient wallet balance" };

      const newBalance = round2(current - amount);
      const tx = makeTransaction({
        type: "debit_order",
        amount: round2(amount),
        balanceBefore: current,
        balanceAfter: newBalance,
        description: `Payment for order #${orderId}`,
        orderId,
      });

      try {
        await writeClient
          .patch(user._id)
          .ifRevisionId(user._rev)
          .set({ walletBalance: newBalance })
          .setIfMissing({ walletTransactions: [] })
          .insert("before", "walletTransactions[0]", [tx])
          .commit();
        return { success: true, message: "Payment deducted from wallet", newBalance };
      } catch (error) {
        if (!isConflict(error)) throw error;
      }
    }
    return { success: false, message: "Wallet is busy, please retry" };
  } catch (error) {
    console.error("Error deducting wallet balance:", error);
    return { success: false, message: "Failed to deduct from wallet" };
  }
}

export type PayOrderResult =
  | { ok: true; newBalance: number; orderId: string }
  | { ok: false; status: number; error: string };

/**
 * Pay an order from the wallet: debit + mark-paid in ONE Sanity transaction.
 * Both documents are revision-guarded, so it is all-or-nothing and two
 * concurrent requests can never both spend the same balance or pay the same
 * order twice (previously: two separate, unguarded writes against CDN reads).
 */
export async function payOrderWithWallet(clerkUserId: string, orderId: string): Promise<PayOrderResult> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const [order, user] = await Promise.all([
      writeClient.fetch<{
        _id: string; _rev: string; orderNumber?: string; totalPrice?: number;
        paymentStatus?: string; orderStatus?: string; clerkUserId?: string;
      } | null>(
        `*[_type == "order" && _id == $orderId][0]{ _id, _rev, orderNumber, totalPrice, paymentStatus, orderStatus, clerkUserId }`,
        { orderId }
      ),
      loadWalletUser(clerkUserId),
    ]);

    if (!order) return { ok: false, status: 404, error: "Order not found" };
    if (order.clerkUserId !== clerkUserId) return { ok: false, status: 403, error: "Unauthorized" };
    if (order.paymentStatus === PAYMENT_STATUSES.PAID) return { ok: false, status: 400, error: "Order is already paid" };
    if (order.orderStatus === ORDER_STATUSES.CANCELLED) {
      return { ok: false, status: 400, error: "Order is cancelled" };
    }
    if (!user) return { ok: false, status: 404, error: "User not found" };

    const total = order.totalPrice || 0;
    const current = user.walletBalance || 0;
    if (current < total) {
      return { ok: false, status: 400, error: "Insufficient wallet balance. Please refund or add funds to your wallet." };
    }

    const newBalance = round2(current - total);
    const tx = makeTransaction({
      type: "debit_purchase",
      amount: total,
      balanceBefore: current,
      balanceAfter: newBalance,
      description: `Payment for order #${order.orderNumber}`,
      orderId: order._id,
      processedBy: "system",
    });

    try {
      await writeClient
        .transaction()
        .patch(user._id, (p) =>
          p
            .ifRevisionId(user._rev)
            .set({ walletBalance: newBalance })
            .setIfMissing({ walletTransactions: [] })
            .insert("before", "walletTransactions[0]", [tx])
        )
        .patch(order._id, (p) =>
          p.ifRevisionId(order._rev).set({
            paymentStatus: PAYMENT_STATUSES.PAID,
            orderStatus: ORDER_STATUSES.PROCESSING,
            paidAt: new Date().toISOString(),
          })
        )
        .commit();
      return { ok: true, newBalance, orderId: order._id };
    } catch (error) {
      if (!isConflict(error)) throw error;
      // else: a concurrent request changed the wallet or the order — re-read and re-check.
    }
  }
  return { ok: false, status: 409, error: "Wallet is busy, please retry" };
}
