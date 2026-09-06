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

    if (user?._id) {
      await writeClient.patch(user._id).set({ preferences: body }).commit();
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
