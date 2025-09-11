"use client";

import { BookingsOverTimeChart } from "@/components/charts/BookingsOverTimeChart";
import { RevenueBySessionChart } from "@/components/charts/RevenueBySessionChart";
import { PopularSessionCategoriesChart } from "@/components/charts/PopularSessionCategoriesChart";
import { UpcomingBookingsChart } from "@/components/charts/UpcomingBookingsChart";
import { ClientAcquisitionChart } from "@/components/charts/ClientAcquisitionChart";
import { RecentPayments } from "@/components/charts/RecentPayments";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Download, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function InsightsPage() {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between py-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Insights</h1>
          <p className="text-muted-foreground">
            Comprehensive analytics and reporting for your booking
            business.
          </p>
        </div>
        <div className="flex items-center space-x-2">
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
      <div className="space-y-6">
        {/* Top Row - Main Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Bookings Over Time</CardTitle>
                <CardDescription>
                  Track your booking trends and seasonal patterns
                </CardDescription>
              </div>
              <Link href="/admin/insights/bookings-over-time">
                <Button variant="ghost" size="sm">
                  View Details
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <BookingsOverTimeChart />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Revenue by Session Type</CardTitle>
                <CardDescription>
                  Which sessions generate the most revenue
                </CardDescription>
              </div>
              <Link href="/admin/insights/revenue-by-session">
                <Button variant="ghost" size="sm">
                  View Details
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <RevenueBySessionChart />
            </CardContent>
          </Card>
        </div>

        {/* Second Row - Category and Booking Analysis */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Popular Categories</CardTitle>
                <CardDescription>
                  Most booked session categories
                </CardDescription>
              </div>
              <Link href="/admin/insights/popular-categories">
                <Button variant="ghost" size="sm">
                  View Details
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <PopularSessionCategoriesChart />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Upcoming Bookings</CardTitle>
                <CardDescription>
                  Next 30 days breakdown
                </CardDescription>
              </div>
              <Link href="/admin/insights/upcoming-bookings">
                <Button variant="ghost" size="sm">
                  View Details
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <UpcomingBookingsChart />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Client Acquisition</CardTitle>
                <CardDescription>
                  New vs returning clients
                </CardDescription>
              </div>
              <Link href="/admin/insights/client-acquisition">
                <Button variant="ghost" size="sm">
                  View Details
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <ClientAcquisitionChart />
            </CardContent>
          </Card>
        </div>

        {/* Third Row - Recent Activity */}
        <div className="grid gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Recent Payments</CardTitle>
                <CardDescription>
                  Latest payment transactions and revenue
                </CardDescription>
              </div>
              <Link href="/admin/insights/recent-payments">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <RecentPayments />
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Row */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">347</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$45,231</div>
              <p className="text-xs text-muted-foreground">
                +8% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">123</div>
              <p className="text-xs text-muted-foreground">
                +23% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg Session Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$130</div>
              <p className="text-xs text-muted-foreground">
                +5% from last month
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
