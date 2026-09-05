export const dynamic = "force-dynamic";

import AppAreaChart from "@/components/AppAreaChart";
import AppBarChart from "@/components/AppBarChart";
import AppPieChart from "@/components/AppPieChart";
import CardList from "@/components/CardList";
import TodoList from "@/components/TodoList";
import { client } from "@/sanity/lib/client";
import { ActionItemType, ChartDistributionType, OrderChartType } from "@/types/admin";

interface SanityOrderRecord {
  totalPrice?: number;
  amount?: number;
  status?: string;
  orderStatus?: string;
  paymentStatus?: string;
  orderDate?: string;
  _createdAt: string;
}

interface SanityPendingOrderRecord {
  _id: string;
  orderNumber?: string;
  customerName?: string;
  orderDate?: string;
  _createdAt?: string;
}

interface SanityLowStockProductRecord {
  _id: string;
  name: string;
  stock?: number;
}

async function getOrderChartData(): Promise<OrderChartType[]> {
  try {
    const orders: SanityOrderRecord[] = await client.fetch(
      `*[_type == "order"] {
        totalPrice,
        amount,
        status,
        orderStatus,
        paymentStatus,
        orderDate,
        _createdAt
      }`
    );

    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const currentMonthIndex = new Date().getMonth();
    const last6Months: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const idx = (currentMonthIndex - i + 12) % 12;
      last6Months.push(months[idx]);
    }

    const chartDataMap: Record<string, { total: number; successful: number }> = {};
    last6Months.forEach((m) => {
      chartDataMap[m] = { total: 0, successful: 0 };
    });

    orders.forEach((ord) => {
      const dateStr = ord.orderDate || ord._createdAt;
      if (!dateStr) return;
      const date = new Date(dateStr);
      const monthName = months[date.getMonth()];
      if (chartDataMap[monthName]) {
        const amt =
          ord.totalPrice !== undefined
            ? ord.totalPrice
            : ord.amount
            ? ord.amount / 100
            : 0;
        chartDataMap[monthName].total += amt;
        const st = (ord.orderStatus || ord.status || ord.paymentStatus || "").toLowerCase();
        if (
          st === "delivered" ||
          st === "paid" ||
          st === "success" ||
          st === "completed"
        ) {
          chartDataMap[monthName].successful += amt;
        }
      }
    });

    return last6Months.map((month) => {
      const data = chartDataMap[month];
      return {
        month,
        total: Math.round(data.total),
        successful: Math.round(data.successful),
      };
    });
  } catch (error) {
    console.error("Error generating order chart data for homepage:", error);
    return [];
  }
}

async function getOrderStatusDistribution(): Promise<ChartDistributionType[]> {
  try {
    const orders: Array<{ orderStatus?: string; status?: string }> = await client.fetch(
      `*[_type == "order"] {
        orderStatus,
        status
      }`
    );

    const counts: Record<string, number> = {
      delivered: 0,
      processing: 0,
      pending: 0,
      shipped: 0,
      cancelled: 0,
    };

    orders.forEach((ord) => {
      const st = (ord.orderStatus || ord.status || "pending").toLowerCase();
      if (st.includes("deliver")) counts.delivered++;
      else if (st.includes("process")) counts.processing++;
      else if (st.includes("ship")) counts.shipped++;
      else if (st.includes("cancel") || st.includes("fail")) counts.cancelled++;
      else counts.pending++;
    });

    const colors: Record<string, string> = {
      delivered: "var(--chart-1)",
      processing: "var(--chart-2)",
      pending: "var(--chart-3)",
      shipped: "var(--chart-4)",
      cancelled: "var(--chart-5)",
    };

    return Object.entries(counts)
      .filter(([, value]) => value > 0)
      .map(([label, value]) => ({
        label,
        value,
        fill: colors[label] || "var(--chart-1)",
      }));
  } catch (error) {
    console.error("Error fetching order status distribution:", error);
    return [];
  }
}

async function getStoreActionItems(): Promise<ActionItemType[]> {
  try {
    const [pendingOrders, lowStockProducts]: [
      SanityPendingOrderRecord[],
      SanityLowStockProductRecord[]
    ] = await Promise.all([
      client.fetch(
        `*[_type == "order" && (orderStatus == "pending" || status == "pending")][0...3] {
          _id,
          orderNumber,
          customerName,
          orderDate,
          _createdAt
        }`
      ),
      client.fetch(
        `*[_type == "product" && (stock <= 5 || !defined(stock))][0...3] {
          _id,
          name,
          stock
        }`
      ),
    ]);

    const tasks: ActionItemType[] = [];

    pendingOrders.forEach((ord) => {
      tasks.push({
        id: `ord-${ord._id}`,
        title: `Dispatch order #${ord.orderNumber || ord._id.slice(0, 8)} (${ord.customerName || "Customer"})`,
        type: "order",
        date: "Action Required",
        isUrgent: true,
      });
    });

    lowStockProducts.forEach((p) => {
      tasks.push({
        id: `stock-${p._id}`,
        title: `Restock '${p.name}' (Current stock: ${p.stock ?? 0})`,
        type: "inventory",
        date: "Inventory Alert",
        isUrgent: (p.stock ?? 0) === 0,
      });
    });

    if (tasks.length === 0) {
      tasks.push({
        id: "healthy-1",
        title: "All orders fulfilled and inventory levels optimal",
        type: "order",
        date: "Up to date",
      });
    }

    return tasks;
  } catch (error) {
    console.error("Error fetching store action items:", error);
    return [];
  }
}

const Homepage = async () => {
  const orderChartData = getOrderChartData();
  const statusDistribution = getOrderStatusDistribution();
  const actionItems = await getStoreActionItems();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-4 py-4">
      <div className="bg-card border p-4 rounded-xl lg:col-span-2 xl:col-span-1 2xl:col-span-2 shadow-xs">
        <AppBarChart dataPromise={orderChartData} />
      </div>
      <div className="bg-card border p-4 rounded-xl shadow-xs">
        <CardList title="Latest Transactions" />
      </div>
      <div className="bg-card border p-4 rounded-xl shadow-xs">
        <AppPieChart dataPromise={statusDistribution} />
      </div>
      <div className="bg-card border p-4 rounded-xl shadow-xs">
        <TodoList actionItems={actionItems} />
      </div>
      <div className="bg-card border p-4 rounded-xl lg:col-span-2 xl:col-span-1 2xl:col-span-2 shadow-xs">
        <AppAreaChart dataPromise={orderChartData} />
      </div>
      <div className="bg-card border p-4 rounded-xl shadow-xs">
        <CardList title="Popular Products" />
      </div>
    </div>
  );
};

export default Homepage;

