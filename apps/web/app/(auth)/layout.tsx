import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/themes";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider appearance={{ theme: shadcn }}>
      <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#2a0645] via-[#520f85] to-[#151515] p-3 sm:p-4 md:p-6 overflow-x-hidden overflow-y-auto">
        {children}
      </div>
    </ClerkProvider>
  );
}
