import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOrderById } from "@repo/sanity/queries";
import { currentUser } from "@clerk/nextjs/server";
import OrderDetailsPage, { OrderDetailsPageProps } from "@/components/OrderDetailsPage";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const rawOrder = await getOrderById(id);
  const order = rawOrder as OrderDetailsPageProps["order"] | null;

  if (!order) {
    return {
      title: "Order Not Found",
    };
  }

  return {
    title: `Order ${order.orderNumber} - U-Shop`,
    description: `Order details for ${order.customerName}`,
  };
}

export default async function OrderDetailsPageRoute({ params }: Props) {
  const user = await currentUser();
  const { id } = await params;

  if (!user) {
    notFound();
  }

  const rawOrder = await getOrderById(id);
  const order = rawOrder as OrderDetailsPageProps["order"] | null;

  if (!order) {
    notFound();
  }

  // Security check: ensure user can only view their own orders
  if (order.clerkUserId !== user.id) {
    notFound();
  }

  return (
    <div className="w-full">
      <OrderDetailsPage order={order} />
    </div>
  );
}
