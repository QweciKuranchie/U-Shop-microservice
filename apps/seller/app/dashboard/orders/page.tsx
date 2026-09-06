/* eslint-disable @typescript-eslint/no-explicit-any */
import { client } from "@repo/sanity";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge, Button } from "@repo/ui";
import Link from "next/link";

export default async function OrdersPage() {
  const orders = await client.fetch(
    `*[_type == "order"] | order(_createdAt desc)[0...20] {
      _id,
      orderNumber,
      customerName,
      email,
      totalPrice,
      status,
      paymentStatus,
      orderDate
    }`
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Customer Orders</h1>
        <p className="text-sm text-muted-foreground">Track fulfillment and customer orders across Ghana.</p>
      </div>
      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders && orders.length > 0 ? (
              orders.map((order: any) => (
                <TableRow key={order._id}>
                  <TableCell className="font-mono font-medium">{order.orderNumber || order._id.slice(0, 8)}</TableCell>
                  <TableCell>{order.customerName || order.email || "Customer"}</TableCell>
                  <TableCell>GH₵ {order.totalPrice || 0}</TableCell>
                  <TableCell>
                    <Badge variant={order.paymentStatus === "paid" ? "default" : "secondary"}>
                      {order.paymentStatus || "pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{order.status || "processing"}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/orders/${order._id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}