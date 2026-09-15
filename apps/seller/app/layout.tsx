import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/themes";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { cn } from "@repo/utils";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "UShop Seller Center",
  description: "Manage your UShop store, listings, and customer orders.",
  icons: {
    icon: [
      { url: "/assets/logos/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/assets/logos/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/logos/favicon/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/assets/logos/favicon/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/assets/logos/favicon/favicon.ico",
    apple: [
      { url: "/assets/logos/favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider appearance={{ theme: shadcn }}>
      <html lang="en" className={cn("font-sans", inter.variable)} suppressHydrationWarning>
        <body className="min-h-screen bg-background font-sans antialiased">
          {children}
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  );
}
