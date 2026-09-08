import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function AdminSignInPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            U-Shop
          </span>
          <span className="ml-1.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            Admin Portal
          </span>
        </div>
      </div>
      <SignIn fallbackRedirectUrl="/dashboard" />
    </div>
  );
}
