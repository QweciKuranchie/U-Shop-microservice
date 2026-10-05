import { NextResponse } from "next/server";

/**
 * DISABLED. Was an unauthenticated stub that accepted a `clerkUserId` from the
 * request body (user lookup oracle) and returned a simulated payment session.
 * Nothing in the real checkout calls it.
 */
export async function POST() {
  return NextResponse.json({ error: "This payment method is not available." }, { status: 501 });
}
