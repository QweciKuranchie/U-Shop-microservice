import AppSidebar from "@/components/AppSidebar";
import Navbar from "@/components/Navbar";
import QueryProvider from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/themes";
import { cookies } from "next/headers";
import { ToastContainer } from "react-toastify";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { verifyIsAdmin } from "@/lib/adminAuth";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in?redirect_url=/admin");
  }

  const isAdmin = await verifyIsAdmin(userId);
  if (!isAdmin) {
    redirect("/?error=unauthorized_admin_access");
  }

  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <ClerkProvider appearance={{ theme: shadcn }}>
      <QueryProvider>
        <div className="flex">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SidebarProvider defaultOpen={defaultOpen}>
              <AppSidebar />
              <main className="w-full">
                <Navbar />
                <div className="px-4">{children}</div>
              </main>
            </SidebarProvider>
          </ThemeProvider>
        </div>
        <ToastContainer position="bottom-right" />
      </QueryProvider>
    </ClerkProvider>
  );
}
