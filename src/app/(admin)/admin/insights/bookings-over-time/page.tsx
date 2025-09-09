"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { BookingsOverTimeChart } from "@/components/charts/BookingsOverTimeChart";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Download, RefreshCw, CalendarDays } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function BookingsOverTimePage() {
  const [period, setPeriod] = useState("day");

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="min-h-screen flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center gap-4">
                <Link href="/admin/insights">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Insights
                  </Button>
                </Link>
                <div>
                  <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
                    <CalendarDays className="h-8 w-8" />
                    Bookings Over Time
                  </h1>
                  <p className="text-muted-foreground">
                    Detailed analysis of booking trends and patterns
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Daily</SelectItem>
                    <SelectItem value="week">Weekly</SelectItem>
                    <SelectItem value="month">Monthly</SelectItem>
                  </SelectContent>
                </Select>
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

            {/* Main Chart */}
            <div className="space-y-6">
              <BookingsOverTimeChart />

              {/* Additional Analytics */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Peak Hours</CardTitle>
                    <CardDescription>Most popular booking times</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">10:00 AM - 11:00 AM</span>
                        <span className="text-sm font-medium">24 bookings</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">2:00 PM - 3:00 PM</span>
                        <span className="text-sm font-medium">21 bookings</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">3:00 PM - 4:00 PM</span>
                        <span className="text-sm font-medium">18 bookings</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Peak Days</CardTitle>
                    <CardDescription>Most popular booking days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Tuesday</span>
                        <span className="text-sm font-medium">47 bookings</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Wednesday</span>
                        <span className="text-sm font-medium">43 bookings</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Thursday</span>
                        <span className="text-sm font-medium">39 bookings</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Booking Trends</CardTitle>
                    <CardDescription>Growth patterns</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">This Week</span>
                        <span className="text-sm font-medium text-green-600">+12%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">This Month</span>
                        <span className="text-sm font-medium text-green-600">+8%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">This Quarter</span>
                        <span className="text-sm font-medium text-green-600">+23%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Statistics</CardTitle>
                  <CardDescription>Comprehensive booking analytics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold">156</div>
                      <div className="text-sm text-muted-foreground">Total Bookings</div>
                      <div className="text-xs text-green-600 mt-1">+12% from last period</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold">5.2</div>
                      <div className="text-sm text-muted-foreground">Avg. per Day</div>
                      <div className="text-xs text-green-600 mt-1">+0.8 from last period</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold">89%</div>
                      <div className="text-sm text-muted-foreground">Show-up Rate</div>
                      <div className="text-xs text-green-600 mt-1">+3% from last period</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold">4.7</div>
                      <div className="text-sm text-muted-foreground">Avg. Rating</div>
                      <div className="text-xs text-green-600 mt-1">+0.2 from last period</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
