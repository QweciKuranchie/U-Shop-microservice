"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {  ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent  } from "@repo/ui";

const chartConfig = {
  orders: {
    label: "Orders",
    color: "var(--chart-1)",
  },
  spent: {
    label: "Spent ($)",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const DEFAULT_ACTIVITY = [
  { month: "Jan", orders: 1, spent: 45 },
  { month: "Feb", orders: 2, spent: 120 },
  { month: "Mar", orders: 1, spent: 85 },
  { month: "Apr", orders: 3, spent: 210 },
  { month: "May", orders: 2, spent: 160 },
  { month: "Jun", orders: 4, spent: 340 },
];

const AppLineChart = ({
  data = DEFAULT_ACTIVITY,
}: {
  data?: Array<{ month: string; orders?: number; spent?: number }>;
}) => {
  return (
    <ChartContainer config={chartConfig} className="mt-4 min-h-[200px] w-full">
      <LineChart
        accessibilityLayer
        data={data}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => String(value).slice(0, 3)}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <Line
          dataKey="orders"
          type="monotone"
          stroke="var(--color-orders)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          dataKey="spent"
          type="monotone"
          stroke="var(--color-spent)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  );
};

export default AppLineChart;

