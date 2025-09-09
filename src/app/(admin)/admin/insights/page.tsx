"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { BookingsOverTimeChart } from "@/components/charts/BookingsOverTimeChart";
import { RevenueBySessionChart } from "@/components/charts/RevenueBySessionChart";
import { PopularSessionCategoriesChart } from "@/components/charts/PopularSessionCategoriesChart";
import { UpcomingBookingsChart } from "@/components/charts/UpcomingBookingsChart";
import { ClientAcquisitionChart } from "@/components/charts/ClientAcquisitionChart";
import { RecentPayments } from "@/components/charts/RecentPayments";
import { Button } from "@/components/ui/button";
import { BarChart3, Download, RefreshCw } from "lucide-react";

export default function InsightsPage() {
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
                <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
                  <BarChart3 className="h-8 w-8" />
                  Insights
                </h1>
                <p className="text-muted-foreground">
                  Comprehensive analytics and reporting for your booking business.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              {/* Bookings Over Time - Full width on larger screens */}
              <div className="xl:col-span-2">
                <BookingsOverTimeChart />
              </div>

              {/* Upcoming Bookings */}
              <div>
                <UpcomingBookingsChart />
              </div>

              {/* Revenue by Session */}
              <div>
                <RevenueBySessionChart />
              </div>

              {/* Popular Categories */}
              <div>
                <PopularSessionCategoriesChart />
              </div>

              {/* Client Acquisition */}
              <div>
                <ClientAcquisitionChart />
              </div>

              {/* Recent Payments - Full width */}
              <div className="xl:col-span-3">
                <RecentPayments />
              </div>
            </div>

            {/* Additional Analytics Section */}
            <div className="mt-8 pt-8 border-t">
              <h2 className="text-xl font-semibold mb-4">Key Performance Indicators</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="bg-card p-4 rounded-lg border">
                  <div className="text-sm font-medium text-muted-foreground">Conversion Rate</div>
                  <div className="text-2xl font-bold">4.2%</div>
                  <div className="text-sm text-green-600">+0.5% from last month</div>
                </div>
                <div className="bg-card p-4 rounded-lg border">
                  <div className="text-sm font-medium text-muted-foreground">Avg. Session Value</div>
                  <div className="text-2xl font-bold">$125</div>
                  <div className="text-sm text-green-600">+$12 from last month</div>
                </div>
                <div className="bg-card p-4 rounded-lg border">
                  <div className="text-sm font-medium text-muted-foreground">Client Retention</div>
                  <div className="text-2xl font-bold">68%</div>
                  <div className="text-sm text-red-600">-2% from last month</div>
                </div>
                <div className="bg-card p-4 rounded-lg border">
                  <div className="text-sm font-medium text-muted-foreground">Booking Rate</div>
                  <div className="text-2xl font-bold">89%</div>
                  <div className="text-sm text-green-600">+3% from last month</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
