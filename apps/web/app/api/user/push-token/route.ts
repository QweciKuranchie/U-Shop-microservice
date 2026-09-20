import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@repo/sanity";
import { getAuthUser } from "@/lib/getAuthUser";

export async function POST(request: NextRequest) {
  const { userId } = await getAuthUser(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const token: unknown = body?.token;

  if (!token || typeof token !== "string" || token.trim() === "") {
    return NextResponse.json(
      { error: "Request body must contain a non-empty 'token' string" },
      { status: 400 }
    );
  }

  const user = await writeClient.fetch<{ _id: string } | null>(
    `*[_type == "user" && clerkUserId == $userId][0]{ _id }`,
    { userId }
  );

  if (!user?._id) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await writeClient.patch(user._id).set({ fcmToken: token.trim() }).commit();

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const { userId } = await getAuthUser(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await writeClient.fetch<{ _id: string } | null>(
    `*[_type == "user" && clerkUserId == $userId][0]{ _id }`,
    { userId }
  );

  if (!user?._id) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await writeClient.patch(user._id).unset(["fcmToken"]).commit();

  return NextResponse.json({ success: true });
}
