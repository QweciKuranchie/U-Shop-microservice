import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { Store } from "lucide-react";

export default function SellerSignInPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 p-[2px] shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Store className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
              U-Shop
            </span>
            <span className="ml-1.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Seller Center
            </span>
          </div>
        </Link>
      </div>
      <SignIn fallbackRedirectUrl="/dashboard" signUpFallbackRedirectUrl="/create-store" />
    </div>
  );
}
