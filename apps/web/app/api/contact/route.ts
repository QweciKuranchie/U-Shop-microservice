import { NextRequest, NextResponse } from "next/server";
import { saveContactMessage } from "@repo/sanity";
import { checkRateLimit, getClientIp } from "@repo/utils";

export async function POST(request: NextRequest) {
  try {
    // Apply Rate Limiting (max 5 requests per 10 mins per IP)
    const rateLimitError = checkRateLimit(request, "contact-form", {
      limit: 5,
      windowMs: 10 * 60 * 1000,
    });
    if (rateLimitError) return rateLimitError;

    const body = await request.json();
    const { name, email, subject, message } = body;

    // Basic validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    // Get client info
    const ipAddress = getClientIp(request);
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Save to Sanity
    const result = await saveContactMessage({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      ipAddress,
      userAgent,
    });

    if (result.success) {
      return NextResponse.json(
        {
          message: "Message sent successfully! We'll get back to you soon.",
          id: result.data?._id,
        },
        { status: 200 }
      );
    } else {
      console.error("Sanity save failed:", result.error);
      return NextResponse.json(
        { error: result.error || "Failed to send message. Please try again." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Contact API Error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
