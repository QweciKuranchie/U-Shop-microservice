"use client";

import { UserButton } from "@clerk/nextjs";

export function SellerHeader({ storeName }: { storeName: string }) {
  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Store:</span>
        <span className="font-semibold text-sm">{storeName}</span>
      </div>
      <div className="flex items-center gap-4">
        <UserButton afterSignOutUrl="https://ushopgh.com/sign-in" />
      </div>
    </header>
  );
}