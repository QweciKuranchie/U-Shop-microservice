"use client";

import { use } from "react";
import { Label, Pie, PieChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";
import { ChartDistributionType } from "@/types/admin";
import { PackageCheck } from "lucide-react";

const chartConfig = {
  orders: {
    label: "Orders",
  },
  delivered: {
    label: "Delivered",
    color: "var(--chart-1)",
  },
  processing: {
    label: "Processing",
    color: "var(--chart-2)",
  },
  pending: {
    label: "Pending",
    color: "var(--chart-3)",
  },
  shipped: {
    label: "Shipped",
    color: "var(--chart-4)",
  },
  cancelled: {
    label: "Cancelled",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

const AppPieChart = ({
  dataPromise,
  title = "Order Fulfillment Status",
}: {
  dataPromise: Promise<ChartDistributionType[]>;
  title?: string;
}) => {
  const chartData = use(dataPromise);
  const totalOrders = chartData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="">
      <h1 className="text-lg font-medium mb-4">{title}</h1>
      {totalOrders > 0 ? (
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[220px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="label"
              innerRadius={55}
              strokeWidth={4}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {totalOrders.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 20}
                          className="fill-muted-foreground text-xs"
                        >
                          Total Orders
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      ) : (
        <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">
          No order records available
        </div>
      )}
      <div className="mt-4 flex flex-col gap-1 items-center text-center">
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <PackageCheck className="h-3.5 w-3.5 text-primary" />
          Live status breakdown from Sanity
        </div>
      </div>
    </div>
  );
};

export default AppPieChart;

