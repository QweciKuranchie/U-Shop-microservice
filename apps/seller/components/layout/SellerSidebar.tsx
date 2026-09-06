"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, ShoppingCart, DollarSign, BarChart3, Store } from "lucide-react";
import { cn } from "@repo/utils";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Listings", href: "/dashboard/listings", icon: ShoppingBag },
  { name: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
  { name: "Payouts", href: "/dashboard/payouts", icon: DollarSign },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Store Settings", href: "/dashboard/store", icon: Store },
];

export function SellerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-card min-h-screen flex flex-col p-4 space-y-6">
      <div className="flex items-center gap-2 px-2">
        <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
          U
        </div>
        <div>
          <h2 className="font-bold text-base leading-tight">UShop Seller</h2>
          <p className="text-xs text-muted-foreground">Seller Center</p>
        </div>
      </div>
      <nav className="space-y-1 flex-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="w-4 h-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
        Need help? Visit <a href="https://ushopgh.com/help" target="_blank" rel="noreferrer" className="underline text-foreground">UShop Support</a>
      </div>
    </aside>
  );
}