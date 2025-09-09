"use client";

import { BarChart3 } from "lucide-react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OverviewChart } from "@/components/charts/overview-chart";
import { RecentPaymentsTable } from "@/components/charts/recent-payments-table";
import { RevenueBarsChart } from "@/components/charts/revenue-bars-chart";

// Mock data

const clientAcquisition = [
  { month: "Jan", new: 45, returning: 28 },
  { month: "Feb", new: 52, returning: 32 },
  { month: "Mar", new: 38, returning: 40 },
  { month: "Apr", new: 65, returning: 45 },
  { month: "May", new: 48, returning: 52 },
  { month: "Jun", new: 55, returning: 58 },
];

const recentPayments = [
  {
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    amount: "$150.00",
    date: "2024-03-15",
    initials: "SJ",
  },
  {
    name: "Michael Brown",
    email: "michael@example.com",
    amount: "$550.00",
    date: "2024-03-12",
    initials: "MB",
  },
  {
    name: "Emma Davis",
    email: "emma.d@example.com",
    amount: "$200.00",
    date: "2024-03-13",
    initials: "ED",
  },
  {
    name: "James Wilson",
    email: "j.wilson@example.com",
    amount: "$120.00",
    date: "2024-03-12",
    initials: "JW",
  },
];

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
