import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { parseBody } from "next-sanity/webhook";
import { tagsForDocumentType } from "@/lib/cache/revalidationTags";

export const dynamic = "force-dynamic";

/**
 * Sanity → Next cache invalidation.
 *
 * Setup (Sanity project → API → Webhooks):
 *   URL:        https://<your-domain>/api/revalidate
 *   Trigger on: create, update, delete
 *   Projection: {_type}   (payload only needs the document type)
 *   Secret:     the value of SANITY_REVALIDATE_SECRET
 *
 * `expire: 0` means the next request waits for fresh data instead of being served
 * the stale copy — the right trade-off for price and stock.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    console.error("SANITY_REVALIDATE_SECRET is not configured");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  try {
    const { isValidSignature, body } = await parseBody<{ _type?: string }>(request, secret, true);

    // Unsigned or wrongly-signed calls are rejected; never revalidate on trust.
    if (!isValidSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const tags = tagsForDocumentType(body?._type);
    for (const tag of tags) {
      revalidateTag(tag, { expire: 0 });
    }

    return NextResponse.json({ revalidated: tags, type: body?._type ?? null });
  } catch (error) {
    console.error("Error handling Sanity revalidation webhook:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
