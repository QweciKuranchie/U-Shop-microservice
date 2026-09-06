import { NextRequest, NextResponse } from "next/server";
import { sanityFetch } from "@repo/sanity/live";
import { defineQuery } from "next-sanity";

const SEARCH_PRODUCTS_QUERY = defineQuery(
  `*[_type == "product" && (name match $searchPattern || category->title match $searchPattern)] | order(name asc) [0...8] {
    _id,
    name,
    slug,
    price,
    discount,
    images
  }`
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();

    if (!query || query.length < 2) {
      return NextResponse.json({ products: [] });
    }

    const searchPattern = `*${query}*`;
    const { data } = await sanityFetch({
      query: SEARCH_PRODUCTS_QUERY,
      params: { searchPattern },
    });

    return NextResponse.json({ products: data ?? [] });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ products: [] }, { status: 500 });
  }
}
