import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getMyOrders } from "@repo/sanity";
import Title from "@/components/Title";
import OrdersClient from "@/components/OrdersClient";
import { MY_ORDERS_QUERYResult } from "@repo/sanity";

interface OrdersPageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

async function UserOrdersPage({ searchParams }: OrdersPageProps) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { page } = await searchParams;
  const currentPage = parseInt(page || "1", 10);
  const ordersPerPage = 20;

  const orderData = await getMyOrders(user.id, currentPage, ordersPerPage);
  const { orders, totalCount, totalPages, hasNextPage, hasPrevPage } =
    orderData;

  const ordersList = (orders as MY_ORDERS_QUERYResult) || [];

  return (
    <div className="space-y-6">
      <div>
        <Title>My Orders</Title>
        {totalCount > 0 && (
          <p className="text-sm text-muted-foreground mt-2">
            Showing {ordersList.length} of {totalCount} orders
          </p>
        )}
      </div>

      <OrdersClient
        initialOrders={ordersList}
        totalPages={totalPages}
        currentPage={currentPage}
        hasNextPage={hasNextPage}
        hasPrevPage={hasPrevPage}
      />
    </div>
  );
}

export default UserOrdersPage;
