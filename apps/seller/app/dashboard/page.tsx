import { createServerClient } from "@repo/supabase/server";
import { client } from "@repo/sanity";
import { SELLER_STORE_QUERY, SELLER_PRODUCTS_COUNT_QUERY, SELLER_ORDERS_COUNT_QUERY } from "@repo/sanity/queries";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { ShoppingBag, ShoppingCart, DollarSign, Clock } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const store = user ? await client.fetch(SELLER_STORE_QUERY, { userId: user.id }) : null;

  const [productsCount, ordersCount] = await Promise.all([
    store?._id
      ? client.fetch(SELLER_PRODUCTS_COUNT_QUERY, { storeId: store._id })
      : Promise.resolve(0),
    client.fetch(SELLER_ORDERS_COUNT_QUERY),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-sm text-muted-foreground">Monitor sales, manage listings, and fulfill customer orders.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Active Listings" value={productsCount ?? 0} description="Published products" icon={ShoppingBag} />
        <KpiCard title="Total Orders" value={ordersCount ?? 0} description="Lifetime store orders" icon={ShoppingCart} />
        <KpiCard title="Total Revenue" value="GH₵ 12,450.00" description="+18% from last month" icon={DollarSign} />
        <KpiCard title="Pending Fulfillment" value="3" description="Requires dispatch" icon={Clock} />
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <SalesChart />
      </div>
    </div>
  );
}