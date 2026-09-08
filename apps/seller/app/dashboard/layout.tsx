import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { client } from "@repo/sanity";
import { SellerSidebar } from "@/components/layout/SellerSidebar";
import { SellerHeader } from "@/components/layout/SellerHeader";
import QueryProvider from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToastContainer } from "react-toastify";
import { SELLER_STORE_QUERY } from "@repo/sanity/queries";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const store = await client.fetch(SELLER_STORE_QUERY, { userId });

  if (!store) {
    redirect("/create-store");
  }

  return (
    <QueryProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <div className="flex min-h-screen bg-background">
          <SellerSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <SellerHeader storeName={store.name} />
            <main className="flex-1 p-6 overflow-y-auto">{children}</main>
          </div>
        </div>
        <ToastContainer position="bottom-right" />
      </ThemeProvider>
    </QueryProvider>
  );
}