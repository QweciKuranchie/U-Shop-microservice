"use client";

import { useRouter } from "next/navigation";
import { createBrowserClient } from "@repo/supabase/client";
import { LogOut, User, Store, ShieldCheck } from "lucide-react";
import { Button } from "@repo/ui";

interface SellerHeaderProps {
  storeName: string;
  sellerEmail?: string;
  sellerType?: string;
}

export function SellerHeader({ storeName, sellerEmail, sellerType = "personal" }: SellerHeaderProps) {
  const router = useRouter();
  const supabase = createBrowserClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/sign-in");
    router.refresh();
  };

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Store className="w-4 h-4 text-purple-500" />
          <span className="text-xs text-muted-foreground">Store:</span>
          <span className="font-semibold text-sm text-foreground">{storeName}</span>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <ShieldCheck className="w-3 h-3" />
          {sellerType}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {sellerEmail && (
          <span className="hidden md:inline text-xs text-muted-foreground truncate max-w-[200px]">
            {sellerEmail}
          </span>
        )}

        <Button
          type="button"
          onClick={handleSignOut}
          variant="outline"
          size="sm"
          className="h-8 px-3 text-xs gap-1.5 border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </Button>
      </div>
    </header>
  );
}