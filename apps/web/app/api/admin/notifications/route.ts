import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { verifyIsAdmin } from "@repo/auth";
import { writeClient } from "@repo/sanity";
import { sendBulkNotifications } from "@/lib/notificationService";
import { v4 as uuidv4 } from "uuid";
import type { NotificationType, NotificationPriority } from "@/lib/notificationService";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = await verifyIsAdmin(userId);
  if (!isAdmin) {
    return NextResponse.json(
      { error: "Forbidden: Admin access required" },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const {
    title,
    message,
    type = "general",
    priority = "medium",
    actionUrl,
    recipientUserIds,
  } = (body || {}) as {
    title?: string;
    message?: string;
    type?: NotificationType;
    priority?: NotificationPriority;
    actionUrl?: string;
    recipientUserIds?: string[];
  };

  if (!title || !message) {
    return NextResponse.json(
      { error: "Both 'title' and 'message' are required" },
      { status: 400 }
    );
  }

  // Fetch admin's email for audit record
  const adminUser = await writeClient.fetch<{ email: string; _id: string } | null>(
    `*[_type == "user" && clerkUserId == $userId][0]{ email, _id }`,
    { userId }
  );

  // Resolve target user IDs and metadata
  let targetUserIds: string[];
  let recipients: Array<{ email: string; name: string; delivered: boolean; read: boolean }>;

  if (recipientUserIds && recipientUserIds.length > 0) {
    const users = await writeClient.fetch<
      Array<{ clerkUserId: string; email: string; firstName?: string; lastName?: string }>
    >(
      `*[_type == "user" && clerkUserId in $ids]{ clerkUserId, email, firstName, lastName }`,
      { ids: recipientUserIds }
    );
    targetUserIds = users.map((u) => u.clerkUserId);
    recipients = users.map((u) => ({
      email: u.email || "",
      name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || "User",
      delivered: true,
      read: false,
    }));
  } else {
    const allUsers = await writeClient.fetch<
      Array<{ clerkUserId: string; email: string; firstName?: string; lastName?: string }>
    >(`*[_type == "user"]{ clerkUserId, email, firstName, lastName }`);
    targetUserIds = allUsers.map((u) => u.clerkUserId);
    recipients = allUsers.map((u) => ({
      email: u.email || "",
      name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || "User",
      delivered: true,
      read: false,
    }));
  }

  // Send bulk notifications
  const result = await sendBulkNotifications(targetUserIds, {
    title,
    message,
    type,
    priority,
    ...(actionUrl && { actionUrl }),
    sentBy: adminUser?.email || "Admin",
  });

  // Write SentNotification audit record in Sanity
  const notificationId = uuidv4();
  await writeClient.create({
    _type: "sentNotification",
    notificationId,
    title,
    message,
    type,
    priority,
    sentAt: new Date().toISOString(),
    sentBy: adminUser?.email || "Admin",
    ...(actionUrl && { actionUrl }),
    recipientCount: targetUserIds.length,
    recipients,
  });

  return NextResponse.json({
    notificationId,
    recipientCount: targetUserIds.length,
    ...result,
  });
}
