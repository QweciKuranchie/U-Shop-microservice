import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/admin",
        destination: "/dashboard",
      },
      {
        source: "/admin/:path*",
        destination: "/dashboard/:path*",
      },
    ];
  },
};

export default nextConfig;
