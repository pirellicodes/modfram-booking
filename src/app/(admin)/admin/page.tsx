"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookingsOverTimeChart } from "@/components/charts/BookingsOverTimeChart";
import { RevenueBySessionChart } from "@/components/charts/RevenueBySessionChart";
import { PopularSessionCategoriesChart } from "@/components/charts/PopularSessionCategoriesChart";
import { RecentPayments } from "@/components/charts/RecentPayments";
import { useDashboardStats } from "@/hooks/use-dashboard-data";
import {
  CalendarIcon,
  DollarSignIcon,
  UsersIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "lucide-react";

function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendValue,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: "up" | "down";
  trendValue?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center pt-1">
          <p className="text-xs text-muted-foreground">{description}</p>
          {trend && trendValue && (
            <div
              className={`flex items-center ml-2 text-xs ${
                trend === "up" ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend === "up" ? (
                <ArrowUpIcon className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDownIcon className="h-3 w-3 mr-1" />
              )}
              {trendValue}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { stats, loading } = useDashboardStats();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="min-h-screen flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between py-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                  Welcome back! Here&apos;s an overview of your booking
                  business.
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
              <StatsCard
                title="Total Bookings"
                value={loading ? "..." : stats.totalBookings}
                description="All time bookings"
                icon={CalendarIcon}
                trend="up"
                trendValue="12% from last month"
              />
              <StatsCard
                title="Total Revenue"
                value={loading ? "..." : formatCurrency(stats.totalRevenue)}
                description="All time revenue"
                icon={DollarSignIcon}
                trend="up"
                trendValue="8% from last month"
              />
              <StatsCard
                title="Total Clients"
                value={loading ? "..." : stats.totalClients}
                description="Registered clients"
                icon={UsersIcon}
                trend="up"
                trendValue="23% from last month"
              />
              <StatsCard
                title="Upcoming Bookings"
                value={loading ? "..." : stats.upcomingBookings}
                description="Next 30 days"
                icon={ClockIcon}
                trend="up"
                trendValue="5% from last month"
              />
            </div>

            {/* Charts Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <BookingsOverTimeChart />
              </div>
              <div className="space-y-6">
                <PopularSessionCategoriesChart />
              </div>
              <div>
                <RevenueBySessionChart />
              </div>
              <div className="lg:col-span-2">
                <RecentPayments />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
