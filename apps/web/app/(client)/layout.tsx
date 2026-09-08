import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import "../globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/themes";
import { UserDataProvider } from "@/contexts/UserDataContext";
import { SanityLive } from "@repo/sanity/live";
import { Toaster } from "sonner";
import AuthModal from "@/components/auth/AuthModal";
import ScrollToTop from "@/components/ScrollToTop";

export const metadata: Metadata = {
  title: "U-Shop",
  description: "U-Shop, Ghana's trusted tech e-commerce platform for buyers and sellers",
  icons: {
    icon: [
      { url: "/assets/logos/favicon/android-chrome-192x192.png", sizes: "192x192", type: "image/png" }
    ],
    shortcut: "/assets/logos/favicon/favicon.ico",
    apple: [
      { url: "/assets/logos/favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
        <ClerkProvider appearance={{ theme: shadcn }}>
          <UserDataProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
            <SpeedInsights />
            <Analytics /> 
            <SanityLive />
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "#ffffff",
                  color: "#520f85",
                  border: "1px solid rgba(212, 0, 155, 0.25)",
                  boxShadow: "0 10px 25px -5px rgba(107, 31, 168, 0.15)",
                  borderRadius: "0.85rem",
                  fontFamily: "var(--font-sans), sans-serif",
                  fontWeight: 500,
                },
              }}
            />
            <ScrollToTop />
            <AuthModal />
          </UserDataProvider>
        </ClerkProvider>
  );
}
