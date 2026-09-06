"use client";

import { use } from "react";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@repo/ui";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { OrderChartType } from "@/types/admin";

const chartConfig = {
  total: {
    label: "Total Volume ($)",
    color: "var(--chart-1)",
  },
  successful: {
    label: "Fulfilled / Paid ($)",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const AppAreaChart = ({
  dataPromise,
  title = "Sales Volume & Revenue Velocity",
}: {
  dataPromise?: Promise<OrderChartType[]>;
  title?: string;
}) => {
  const chartData = dataPromise ? use(dataPromise) : [];

  return (
    <div className="">
      <h1 className="text-lg font-medium mb-4">{title}</h1>
      <ChartContainer config={chartConfig} className="min-h-[220px] w-full">
        <AreaChart accessibilityLayer data={chartData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => value ? value.slice(0, 3) : ""}
          />
          <YAxis tickLine={false} tickMargin={10} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <defs>
            <linearGradient id="fillTotal" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-total)"
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor="var(--color-total)"
                stopOpacity={0.1}
              />
            </linearGradient>
            <linearGradient id="fillSuccessful" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-successful)"
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor="var(--color-successful)"
                stopOpacity={0.1}
              />
            </linearGradient>
          </defs>
          <Area
            dataKey="total"
            type="natural"
            fill="url(#fillTotal)"
            fillOpacity={0.4}
            stroke="var(--color-total)"
            stackId="a"
          />
          <Area
            dataKey="successful"
            type="natural"
            fill="url(#fillSuccessful)"
            fillOpacity={0.4}
            stroke="var(--color-successful)"
            stackId="a"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
};

export default AppAreaChart;

