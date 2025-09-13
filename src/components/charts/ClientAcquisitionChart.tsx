"use client";

import { useClientAcquisition } from "@/hooks/use-dashboard-data";
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
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Users, TrendingUp } from "lucide-react";

const chartConfig = {
  newClients: {
    label: "New Clients",
    color: "hsl(var(--chart-1))",
  },
  returningClients: {
    label: "Returning Clients",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function ClientAcquisitionChart() {
  const { data, loading, error } = useClientAcquisition();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Client Acquisition
          </CardTitle>
          <CardDescription>
            New vs returning clients over the last 30 days
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
            <Users className="h-5 w-5" />
            Client Acquisition
          </CardTitle>
          <CardDescription>
            New vs returning clients over the last 30 days
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

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Client Acquisition
          </CardTitle>
          <CardDescription>
            New vs returning clients over the last 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No client data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalNewClients = data.reduce((sum, item) => sum + item.newClients, 0);
  const totalReturningClients = data.reduce(
    (sum, item) => sum + item.returningClients,
    0
  );
  const newClientRatio =
    totalNewClients + totalReturningClients > 0
      ? Math.round(
          (totalNewClients / (totalNewClients + totalReturningClients)) * 100
        )
      : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Client Acquisition
        </CardTitle>
        <CardDescription>
          New vs returning clients over the last 30 days
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
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar
              dataKey="newClients"
              fill="var(--color-newClients)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="returningClients"
              fill="var(--color-returningClients)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>

        {/* Summary stats */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-semibold text-chart-1">
              {totalNewClients}
            </div>
            <div className="text-sm text-muted-foreground">New Clients</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-semibold text-chart-2">
              {totalReturningClients}
            </div>
            <div className="text-sm text-muted-foreground">
              Returning Clients
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-4 text-sm">
          <TrendingUp className="h-4 w-4" />
          <span className="text-muted-foreground">
            {newClientRatio}% of clients are new acquisitions
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
