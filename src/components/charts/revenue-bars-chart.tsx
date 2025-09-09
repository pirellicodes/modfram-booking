"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const revenueData = [
  { name: "1-on-1 Training", revenue: 2500, color: "bg-blue-500" },
  { name: "Group Classes", revenue: 1800, color: "bg-green-500" },
  { name: "Workshops", revenue: 1200, color: "bg-purple-500" },
  { name: "Online Sessions", revenue: 900, color: "bg-orange-500" },
];

export function RevenueBarsChart() {
  const maxRevenue = Math.max(...revenueData.map(item => item.revenue));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue by Session Type</CardTitle>
        <CardDescription>Distribution across services</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {revenueData.map((item) => (
            <div key={item.name} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{item.name}</span>
                <span className="text-sm font-bold">
                  ${item.revenue.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`${item.color} h-3 rounded-full transition-all duration-500 ease-out`}
                  style={{
                    width: `${(item.revenue / maxRevenue) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </span>
            <span className="text-lg font-bold">
              ${revenueData.reduce((acc, curr) => acc + curr.revenue, 0).toLocaleString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
