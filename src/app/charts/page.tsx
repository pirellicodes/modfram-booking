"use client";

import { BarChart3 } from "lucide-react";

import { OverviewChart } from "@/components/charts/overview-chart";
import { RecentPaymentsTable } from "@/components/charts/recent-payments-table";
import { RevenueBarsChart } from "@/components/charts/revenue-bars-chart";

// Mock data

export default function ChartsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="size-8" />
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Bookings Over Time */}
        <div className="col-span-2">
          <OverviewChart />
        </div>

        {/* Revenue by Session Type */}
        <RevenueBarsChart />

        {/* Recent Payments Table */}
        <div className="col-span-3">
          <RecentPaymentsTable />
        </div>
      </div>
    </div>
  );
}
