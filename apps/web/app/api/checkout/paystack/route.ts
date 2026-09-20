import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/getAuthUser";
import {
  ghsToPesewas,
  generatePaystackReference,
  validateMomoPhone,
} from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await getAuthUser(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, orderNumber, amount, email, channel, phone } = body;

    // Validate required fields
    if (!orderId || !orderNumber || amount === undefined || !email || !channel) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (channel !== "card" && channel !== "momo") {
      return NextResponse.json(
        { error: "Invalid payment channel" },
        { status: 400 }
      );
    }

    if (channel === "momo") {
      if (!phone) {
        return NextResponse.json(
          { error: "Phone number is required for Mobile Money" },
          { status: 400 }
        );
      }
      if (!validateMomoPhone(phone)) {
        return NextResponse.json(
          { error: "Invalid Mobile Money phone number" },
          { status: 400 }
        );
      }
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      console.error("PAYSTACK_SECRET_KEY is not set");
      return NextResponse.json(
        { error: "Payment processor is not configured" },
        { status: 500 }
      );
    }

    const reference = generatePaystackReference(orderNumber);
    const amountInPesewas = ghsToPesewas(amount);
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const paystackPayload: Record<string, unknown> = {
      email,
      amount: amountInPesewas,
      currency: "GHS",
      reference,
      callback_url: `${baseUrl}/api/checkout/paystack/callback`,
      channels: channel === "card" ? ["card"] : ["mobile_money"],
      metadata: {
        orderId,
        orderNumber,
        channel,
      },
    };

    if (channel === "momo" && phone) {
      paystackPayload.mobile_money = { phone };
    }

    const paystackRes = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paystackPayload),
      }
    );

    const paystackData = await paystackRes.json();

    if (!paystackRes.ok || !paystackData.status) {
      console.error("Paystack initialization failed:", paystackData);
      return NextResponse.json(
        {
          error:
            paystackData.message || "Failed to initialize Paystack transaction",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      authorizationUrl: paystackData.data.authorization_url,
      reference: paystackData.data.reference,
      accessCode: paystackData.data.access_code,
    });
  } catch (error: unknown) {
    console.error("Error in /api/checkout/paystack:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
