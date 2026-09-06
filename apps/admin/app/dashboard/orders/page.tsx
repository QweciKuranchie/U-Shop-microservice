export const dynamic = "force-dynamic";

import { OrderType } from "@/types/admin";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { client } from "@repo/sanity";

const getData = async (): Promise<OrderType[]> => {
  try {
    const orders = await client.fetch(
      `*[_type == "order"] | order(orderDate desc, _createdAt desc) {
        _id,
        orderNumber,
        customerEmail,
        email,
        status,
        totalPrice,
        amount,
        clerkUserId,
        userClerkId,
        customerName,
        fullName,
        orderDate,
        _createdAt
      }`
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return orders.map((ord: any) => {
      const amount =
        ord.totalPrice !== undefined
          ? ord.totalPrice * 100
          : ord.amount || 0;
      return {
        id: ord._id,
        _id: ord._id,
        orderNumber: ord.orderNumber || ord._id,
        email: ord.customerEmail || ord.email || "customer@example.com",
        status: ord.status || "pending",
        amount: typeof amount === "number" ? amount : 0,
        userId: ord.clerkUserId || ord.userClerkId || "",
        fullName: ord.customerName || ord.fullName || "Customer",
        createdAt: ord.orderDate || ord._createdAt || new Date().toISOString(),
      };
    });
  } catch (err) {
    console.error("Error fetching orders for admin orders page:", err);
    return [];
  }
};

const OrdersPage = async () => {
  const data = await getData();
  return (
    <div className="py-4 space-y-6">
      <div className="flex items-center justify-between px-4 py-3 bg-card border rounded-lg shadow-xs">
        <div>
          <h1 className="font-semibold text-lg">Orders & Payments</h1>
          <p className="text-xs text-muted-foreground">
            Monitor store transactions, payment statuses, and customer orders
          </p>
        </div>
        <div className="text-sm font-medium text-muted-foreground">
          Total Orders:{" "}
          <span className="text-foreground font-bold">{data.length}</span>
        </div>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
};

export default OrdersPage;
