import { NextResponse } from "next/server";
import { getImageKitAuthParams } from "@repo/media";

export async function GET() {
  try {
    const authParams = getImageKitAuthParams();
    return NextResponse.json(authParams);
  } catch (error: any) {
    console.error("Error generating ImageKit auth parameters:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate authentication parameters." },
      { status: 500 }
    );
  }
}
