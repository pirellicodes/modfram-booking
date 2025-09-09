"use client"

import { ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useTheme } from "next-themes"

const data = [
  {
    name: "Product A",
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: "Product B",
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: "Product C",
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: "Product D",
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: "Product E",
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: "Product F",
    total: Math.floor(Math.random() * 5000) + 1000,
  },
]

export function PopularProductsChart() {
  const { theme: mode } = useTheme()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Popular Products</CardTitle>
        <CardDescription>Top selling products this month.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
              layout="vertical"
            >
              <XAxis
                type="number"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Product
                            </span>
                            <span className="font-bold">{payload[0].payload.name}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Revenue
                            </span>
                            <span className="font-bold">
                              ${payload[0].value?.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar
                dataKey="total"
                fill={mode === "light" ? "rgb(22,163,74)" : "rgb(34,197,94)"}
                radius={[4, 4, 4, 4]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
