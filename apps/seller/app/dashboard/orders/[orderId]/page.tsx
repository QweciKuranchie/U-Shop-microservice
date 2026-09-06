import { client } from "@repo/sanity";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@repo/ui";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = await client.fetch(`*[_type == "order" && _id == $orderId][0]`, { orderId });

  if (!order) {
    return <div>Order not found.</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Link href="/dashboard/orders" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </Link>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Order {order.orderNumber || order._id}</h1>
        <p className="text-sm text-muted-foreground">Customer: {order.customerName || order.email}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Price:</span>
            <span className="font-bold">GH₵ {order.totalPrice || 0}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Payment Status:</span>
            <Badge variant="outline">{order.paymentStatus || "pending"}</Badge>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Fulfillment Status:</span>
            <Badge>{order.status || "processing"}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}