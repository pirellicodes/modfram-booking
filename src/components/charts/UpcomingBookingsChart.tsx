"use client";

import { useDashboardStats } from "@/hooks/use-dashboard-data";
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
import { RadialBar, RadialBarChart } from "recharts";
import { Calendar, TrendingUp } from "lucide-react";

const chartConfig = {
  upcoming: {
    label: "Upcoming Bookings",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export function UpcomingBookingsChart() {
  const { stats, loading, error } = useDashboardStats();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Bookings
          </CardTitle>
          <CardDescription>
            Bookings scheduled for the next 30 days
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
            <Calendar className="h-5 w-5" />
            Upcoming Bookings
          </CardTitle>
          <CardDescription>
            Bookings scheduled for the next 30 days
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

  // Calculate percentage based on total bookings
  const percentage =
    stats.totalBookings > 0
      ? Math.round((stats.upcomingBookings / stats.totalBookings) * 100)
      : 0;

  const chartData = [
    {
      name: "Upcoming",
      value: stats.upcomingBookings,
      total: stats.totalBookings,
      fill: "var(--color-upcoming)",
    },
  ];

  // For radial bar chart, we need to show progress
  const progressData = [
    {
      name: "progress",
      value: percentage,
      fill: "hsl(var(--chart-3))",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Bookings
        </CardTitle>
        <CardDescription>
          Bookings scheduled for the next 30 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <RadialBarChart
            data={progressData}
            startAngle={90}
            endAngle={-270}
            innerRadius={60}
            outerRadius={120}
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <RadialBar
              dataKey="value"
              cornerRadius={10}
              fill="var(--color-upcoming)"
            />
          </RadialBarChart>
        </ChartContainer>

        {/* Center content showing actual numbers */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground">
              {stats.upcomingBookings}
            </div>
            <div className="text-sm text-muted-foreground">Upcoming</div>
          </div>
        </div>

        {/* Stats breakdown */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-semibold text-foreground">
              {stats.totalBookings}
            </div>
            <div className="text-sm text-muted-foreground">Total Bookings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-foreground">
              {percentage}%
            </div>
            <div className="text-sm text-muted-foreground">Upcoming Ratio</div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-4 text-sm">
          <TrendingUp className="h-4 w-4" />
          <span className="text-muted-foreground">
            {stats.upcomingBookings > 0
              ? `${stats.upcomingBookings} bookings in the next 30 days`
              : "No upcoming bookings scheduled"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
