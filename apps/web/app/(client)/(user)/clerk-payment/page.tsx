import { notFound } from "next/navigation";

/**
 * Removed: simulated payment page whose "complete" action marked orders paid
 * without any payment. Not linked from the real checkout.
 */
export default function ClerkPaymentPage() {
  notFound();
}
