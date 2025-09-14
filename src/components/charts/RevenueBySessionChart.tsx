"use client";

import { DollarSign, TrendingUp } from "lucide-react";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

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
import { useRevenueBySession } from "@/hooks/use-dashboard-data";

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function RevenueBySessionChart() {
  const { data, loading, error } = useRevenueBySession();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Revenue by Session Type
          </CardTitle>
          <CardDescription>Revenue breakdown by session type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Revenue by Session Type
          </CardTitle>
          <CardDescription>Revenue breakdown by session type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const topSession = data.reduce((top, current) =>
    current.revenue > top.revenue ? current : top,
    data[0] || { sessionType: "", revenue: 0 }
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Revenue by Session Type
        </CardTitle>
        <CardDescription>
          Revenue breakdown by session type
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <XAxis
              dataKey="sessionType"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                // Truncate long session names
                return value.length > 12 ? `${value.substring(0, 12)}...` : value;
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `$${value}`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent
                formatter={(value, name) => [
                  `$${Number(value).toFixed(2)}`,
                  "Revenue"
                ]}
              />}
            />
            <Bar
              dataKey="revenue"
              fill="var(--color-revenue)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
        <div className="flex items-center gap-2 pt-4 text-sm">
          <TrendingUp className="h-4 w-4" />
          <span className="text-muted-foreground">
            Top performer: {topSession.sessionType} (${topSession.revenue.toFixed(2)})
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
