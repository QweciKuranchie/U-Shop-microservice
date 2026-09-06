import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui";
import { DollarSign } from "lucide-react";

export default function PayoutsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Seller Payouts</h1>
        <p className="text-sm text-muted-foreground">Manage your earnings, MoMo/Bank settlement accounts, and payout history.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">GH₵ 3,820.00</div>
            <p className="text-xs text-muted-foreground mt-1">Next automatic settlement: Friday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Escrow</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">GH₵ 1,450.00</div>
            <p className="text-xs text-muted-foreground mt-1">Pending order delivery confirmation</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}