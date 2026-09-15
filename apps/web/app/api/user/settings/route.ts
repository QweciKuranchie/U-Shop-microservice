import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@repo/sanity";
import { getUserByClerkId } from "@repo/sanity/queries";

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const user = await getUserByClerkId(userId);

    const preferencesObj = (body && typeof body === "object" && "preferences" in body ? body.preferences : body) || {};
    const dotNotationPatch: Record<string, unknown> = {};

    if (preferencesObj && typeof preferencesObj === "object") {
      for (const [key, value] of Object.entries(preferencesObj)) {
        dotNotationPatch[`preferences.${key}`] = value;
      }
    }

    if (user?._id && Object.keys(dotNotationPatch).length > 0) {
      await writeClient.patch(user._id).set(dotNotationPatch).commit();
    }

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
