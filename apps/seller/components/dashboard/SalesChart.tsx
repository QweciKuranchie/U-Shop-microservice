"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui";

const sampleData = [
  { name: "Mon", revenue: 450 },
  { name: "Tue", revenue: 920 },
  { name: "Wed", revenue: 680 },
  { name: "Thu", revenue: 1200 },
  { name: "Fri", revenue: 1850 },
  { name: "Sat", revenue: 2300 },
  { name: "Sun", revenue: 1950 },
];

export function SalesChart() {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Weekly Revenue Overview</CardTitle>
        <CardDescription>Daily revenue generated across all store orders</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sampleData}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `GH₵${val}`} />
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <Tooltip formatter={(value: any) => [`GH₵${value}`, "Revenue"]} />
            <Area type="monotone" dataKey="revenue" stroke="#D4009B" fill="#D4009B" fillOpacity={0.15} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}