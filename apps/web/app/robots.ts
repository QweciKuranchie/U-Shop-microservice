import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://ushopgh.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/admin/",
        "/user/admin/",
        "/employee/",
        "/user/",
        "/dashboard/",
        "/studio/",
        "/_next/",
        "/checkout/",
        "/cart/",
        "/wishlist/",
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
