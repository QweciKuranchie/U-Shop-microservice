"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@repo/supabase/client";
import { Clock, ShieldCheck, CheckCircle2, MessageSquare, LogOut, Store } from "lucide-react";
import { Button } from "@repo/ui";

export default function PendingReviewPage() {
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
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/10">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>
          <span className="inline-block text-[11px] uppercase tracking-wider font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full mb-2">
            Application Under Review
          </span>
          <h1 className="text-2xl font-extrabold text-white">We're Reviewing Your KYC</h1>
          <p className="text-sm text-slate-400 mt-2">
            Thank you for submitting your seller application! Our compliance team manually verifies all merchant documents to protect Ghana's buyers and sellers.
          </p>
        </div>

        <div className="space-y-4 my-6 bg-slate-950/60 border border-slate-800/80 rounded-xl p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Verification Timeline</h3>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Account Created & Profile Registered</p>
              <p className="text-[11px] text-slate-500">Contact information recorded successfully.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">KYC Documents Uploaded</p>
              <p className="text-[11px] text-slate-500">Encrypted in Supabase Storage & queued for review.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-amber-300">Manual Admin Review (In Progress)</p>
              <p className="text-[11px] text-slate-400">Usually completed within 12 to 24 business hours.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 opacity-50">
            <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">Storefront Activated</p>
              <p className="text-[11px] text-slate-500">Dashboard access unlocked & listings go live.</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 space-y-1 mb-6">
          <p className="font-semibold">Need urgent assistance or have questions?</p>
          <p className="text-slate-400">
            Contact our merchant support team on WhatsApp at <span className="text-purple-300 font-medium">+233 50 956 5794</span> or email <span className="text-purple-300 font-medium">ghanaushop@gmail.com</span>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={() => window.location.reload()}
            className="flex-1 h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium rounded-xl text-sm"
          >
            Check Status Again
          </Button>

          <Button
            type="button"
            onClick={handleSignOut}
            variant="outline"
            className="h-11 px-4 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl flex items-center gap-2 text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
