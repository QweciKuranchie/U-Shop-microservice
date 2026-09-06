import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Stripe integration is disabled. Invoice generation is coming soon." },
    { status: 501 }
  );
}
