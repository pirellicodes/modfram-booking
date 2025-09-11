"use client";

import { TrendingUp } from "lucide-react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

import { Card, CardContent } from "@/components/ui/card";

const data = [
  {
    month: "January",
    value: 80,
  },
  {
    month: "February",
    value: 65,
  },
  {
    month: "March",
    value: 85,
  },
  {
    month: "April",
    value: 70,
  },
  {
    month: "May",
    value: 90,
  },
  {
    month: "June",
    value: 75,
  },
];

export function RadarShapeChart() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-2">
        <CardTitle className="text-lg">Activity Patterns</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data} cx="50%" cy="50%" outerRadius="80%">
              <PolarGrid stroke="hsl(220, 13%, 91%)" strokeDasharray="3 3" />
              <PolarAngleAxis
                dataKey="month"
                tick={{
                  fill: "hsl(215, 20%, 65%)",
                  fontSize: 12,
                  fontWeight: 500,
                }}
              />
              <PolarRadiusAxis
                tick={{ fill: "hsl(215, 20%, 65%)", fontSize: 12 }}
                stroke="hsl(220, 13%, 91%)"
              />
              <Radar
                name="Value"
                dataKey="value"
                stroke="hsl(220, 70%, 50%)"
                fill="hsl(220, 70%, 50%)"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
