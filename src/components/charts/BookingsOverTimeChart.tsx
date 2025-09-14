"use client";

import { CalendarDays, TrendingUp } from "lucide-react";
import { Area, AreaChart, XAxis, YAxis } from "recharts";

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
import { useBookingsOverTime } from "@/hooks/use-dashboard-data";

const chartConfig = {
  bookings: {
    label: "Bookings",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function BookingsOverTimeChart() {
  const { data, loading, error } = useBookingsOverTime();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Bookings Over Time
          </CardTitle>
          <CardDescription>
            Daily booking trends for the last 30 days
          </CardDescription>
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
            <CalendarDays className="h-5 w-5" />
            Bookings Over Time
          </CardTitle>
          <CardDescription>
            Daily booking trends for the last 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalBookings = data.reduce((sum, item) => sum + item.bookings, 0);
  const averageBookings =
    data.length > 0 ? (totalBookings / data.length).toFixed(1) : "0";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Bookings Over Time
        </CardTitle>
        <CardDescription>
          Daily booking trends for the last 30 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
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
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickCount={3}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="bookings"
              type="natural"
              fill="var(--color-bookings)"
              fillOpacity={0.4}
              stroke="var(--color-bookings)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
        <div className="flex items-center gap-2 pt-4 text-sm">
          <TrendingUp className="h-4 w-4" />
          <span className="text-muted-foreground">
            Average {averageBookings} bookings per day
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
