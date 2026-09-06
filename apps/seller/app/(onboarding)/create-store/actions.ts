"use server";

import { auth } from "@clerk/nextjs/server";
import { writeClient } from "@repo/sanity";
import { redirect } from "next/navigation";

export async function createStoreAction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const ownerName = formData.get("ownerName") as string;
  const description = formData.get("description") as string;
  const sellerType = (formData.get("sellerType") as string) || "personal";

  if (!name || !ownerName) {
    throw new Error("Store name and Owner name are required");
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

  await writeClient.create({
    _type: "store",
    name,
    slug: { _type: "slug", current: slug },
    ownerName,
    clerkUserId: userId,
    sellerType,
    description: description || "",
    status: "active",
  });

  redirect("/dashboard");
}