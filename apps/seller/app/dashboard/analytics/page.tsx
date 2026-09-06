import { SalesChart } from "@/components/dashboard/SalesChart";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Store Analytics</h1>
        <p className="text-sm text-muted-foreground">Comprehensive sales metrics, conversion rates, and revenue trends.</p>
      </div>
      <SalesChart />
    </div>
  );
}