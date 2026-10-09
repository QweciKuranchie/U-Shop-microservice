/**
 * GROQ for wallet mutations, kept in a pure module so it can be executed against
 * an in-memory dataset in tests (the idempotency check decides whether a customer
 * is refunded once, twice or never).
 */
export const WALLET_USER_QUERY = `*[_type == "user" && clerkUserId == $clerkUserId][0]{
  _id, _rev, walletBalance,
  "alreadyCredited": defined($refundOrderId) && count(coalesce(walletTransactions, [])[type == "credit_refund" && orderId == $refundOrderId]) > 0
}`;
