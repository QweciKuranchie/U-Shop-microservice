"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@repo/supabase/client";
import { XCircle, AlertTriangle, ArrowRight, LogOut, Store, RefreshCw } from "lucide-react";
import { Button } from "@repo/ui";

export default function RejectedApplicationPage() {
  const router = useRouter();
  const supabase = createBrowserClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/sign-in");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 py-12">
      <div className="mb-8 flex flex-col items-center gap-3">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 p-[2px] shadow-xl shadow-purple-500/20 group-hover:scale-105 transition-all">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Store className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
              U-Shop
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 w-fit">
              Seller Center
            </span>
          </div>
        </Link>
      </div>

      <div className="w-full max-w-lg bg-slate-900/90 border border-slate-800/80 rounded-2xl shadow-2xl p-8 backdrop-blur-xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-500/10">
            <XCircle className="w-8 h-8" />
          </div>
          <span className="inline-block text-[11px] uppercase tracking-wider font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full mb-2">
            Action Required
          </span>
          <h1 className="text-2xl font-extrabold text-white">Application Needs Revision</h1>
          <p className="text-sm text-slate-400 mt-2">
            Our compliance review could not approve your seller application with the current documents provided.
          </p>
        </div>

        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 space-y-2">
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>Common reasons for rejection:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1">
            <li>National ID card photo was blurry, cropped, or expired</li>
            <li>Business name does not match the registration certificate</li>
            <li>Student ID or institutional email proof is not clearly legible</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Button
            type="button"
            onClick={() => router.push("/create-store")}
            className="w-full h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20"
          >
            <RefreshCw className="w-4 h-4" />
            Update & Resubmit Documents
          </Button>

          <Button
            type="button"
            onClick={handleSignOut}
            variant="outline"
            className="w-full h-11 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl flex items-center justify-center gap-2 text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
