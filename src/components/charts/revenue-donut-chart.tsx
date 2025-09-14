"use client";

import { Cell,Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartData = [
  { name: "1-on-1 Training", revenue: 2500, fill: "hsl(var(--chart-1))" },
  { name: "Group Classes", revenue: 1800, fill: "hsl(var(--chart-2))" },
  { name: "Workshops", revenue: 1200, fill: "hsl(var(--chart-3))" },
  { name: "Online Sessions", revenue: 900, fill: "hsl(var(--chart-4))" },
];

const chartConfig = {
  revenue: {
    label: "Revenue",
  },
  "1-on-1 Training": {
    label: "1-on-1 Training",
    color: "hsl(var(--chart-1))",
  },
  "Group Classes": {
    label: "Group Classes",
    color: "hsl(var(--chart-2))",
  },
  Workshops: {
    label: "Workshops",
    color: "hsl(var(--chart-3))",
  },
  "Online Sessions": {
    label: "Online Sessions",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

export function RevenueDonutChart() {
  const total = chartData.reduce((acc, curr) => acc + curr.revenue, 0);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-2">
        <CardTitle>Revenue by Session Type</CardTitle>
        <CardDescription>Distribution across services</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="revenue"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardContent className="flex-col gap-2 text-center">
        <div className="text-2xl font-bold">${total.toLocaleString()}</div>
        <div className="text-muted-foreground">Total Revenue</div>
        <div className="grid grid-cols-2 gap-2 mt-4">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center gap-2 text-xs">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-muted-foreground">{item.name}</span>
              <span className="font-medium ml-auto">
                ${item.revenue.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
