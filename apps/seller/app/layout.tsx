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
