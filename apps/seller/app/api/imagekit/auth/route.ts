import { NextRequest, NextResponse } from "next/server";
import { getImageKitAuthParams } from "@repo/media";
import { checkRateLimit } from "@repo/utils";

export async function GET(request: NextRequest) {
  try {
    const rateLimitError = checkRateLimit(request, "imagekit-auth", {
      limit: 20,
      windowMs: 60 * 1000,
    });
    if (rateLimitError) return rateLimitError;

    const authParams = getImageKitAuthParams();
    return NextResponse.json(authParams);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to generate authentication parameters.";
    console.error("Error generating ImageKit auth parameters:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
