import { MetadataRoute } from "next";
import { client } from "@repo/sanity";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // Revalidate sitemap every hour

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://ushopgh.com";

interface SanityItem {
  slug: { current: string };
  _updatedAt?: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/shop`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/category`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/deals`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/stores`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/universities`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/help`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/faqs`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  try {
    // Only attempt Sanity fetch if valid project configured
    const products = await client
      .fetch<SanityItem[]>(
        `*[_type == "product" && defined(slug.current)]{ slug, _updatedAt }`
      )
      .catch(() => []);

    const categories = await client
      .fetch<SanityItem[]>(
        `*[_type == "category" && defined(slug.current)]{ slug, _updatedAt }`
      )
      .catch(() => []);

    const brands = await client
      .fetch<SanityItem[]>(
        `*[_type == "brand" && defined(slug.current)]{ slug, _updatedAt }`
      )
      .catch(() => []);

    const stores = await client
      .fetch<SanityItem[]>(
        `*[_type == "store" && defined(slug.current)]{ slug, _updatedAt }`
      )
      .catch(() => []);

    const productRoutes: MetadataRoute.Sitemap = (products || [])
      .filter((p) => p?.slug?.current)
      .map((product) => ({
        url: `${BASE_URL}/product/${encodeURIComponent(product.slug.current)}`,
        lastModified: product._updatedAt ? new Date(product._updatedAt) : now,
        changeFrequency: "daily",
        priority: 0.7,
      }));

    const categoryRoutes: MetadataRoute.Sitemap = (categories || [])
      .filter((c) => c?.slug?.current)
      .map((category) => ({
        url: `${BASE_URL}/category/${encodeURIComponent(category.slug.current)}`,
        lastModified: category._updatedAt ? new Date(category._updatedAt) : now,
        changeFrequency: "weekly",
        priority: 0.8,
      }));

    const brandRoutes: MetadataRoute.Sitemap = (brands || [])
      .filter((b) => b?.slug?.current)
      .map((brand) => ({
        url: `${BASE_URL}/brand/${encodeURIComponent(brand.slug.current)}`,
        lastModified: brand._updatedAt ? new Date(brand._updatedAt) : now,
        changeFrequency: "weekly",
        priority: 0.6,
      }));

    const storeRoutes: MetadataRoute.Sitemap = (stores || [])
      .filter((s) => s?.slug?.current)
      .map((store) => ({
        url: `${BASE_URL}/store/${encodeURIComponent(store.slug.current)}`,
        lastModified: store._updatedAt ? new Date(store._updatedAt) : now,
        changeFrequency: "weekly",
        priority: 0.7,
      }));

    return [
      ...staticRoutes,
      ...categoryRoutes,
      ...productRoutes,
      ...brandRoutes,
      ...storeRoutes,
    ];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return staticRoutes;
  }
}
