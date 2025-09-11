"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { RevenueBySessionChart } from "@/components/charts/RevenueBySessionChart";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign, Download, RefreshCw, TrendingUp } from "lucide-react";

export default function RevenueBySessionPage() {
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
                <p className="text-muted-foreground">
                  Analyze revenue performance across different session types to
                  optimize your pricing strategy.
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

            {/* Main Chart */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Revenue Breakdown
                </CardTitle>
                <CardDescription>
                  Total revenue generated from each session type over time
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[500px]">
                <RevenueBySessionChart />
              </CardContent>
            </Card>

            {/* Revenue Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Highest Revenue Session
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Consultation</div>
                  <p className="text-xs text-muted-foreground">
                    $12,450 this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Average Session Value
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$125</div>
                  <p className="text-xs text-muted-foreground">
                    +8% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Session Types
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">6</div>
                  <p className="text-xs text-muted-foreground">
                    Active session types
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Revenue Growth
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+12%</div>
                  <p className="text-xs text-muted-foreground">vs last month</p>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Breakdown Table */}
            <Card>
              <CardHeader>
                <CardTitle>Session Type Performance</CardTitle>
                <CardDescription>
                  Detailed breakdown of revenue by session type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2">Session Type</th>
                        <th className="text-right py-3 px-2">Revenue</th>
                        <th className="text-right py-3 px-2">Bookings</th>
                        <th className="text-right py-3 px-2">Avg. Value</th>
                        <th className="text-right py-3 px-2">Growth</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 px-2 font-medium">Consultation</td>
                        <td className="text-right py-3 px-2">$12,450</td>
                        <td className="text-right py-3 px-2">89</td>
                        <td className="text-right py-3 px-2">$140</td>
                        <td className="text-right py-3 px-2 text-green-600">
                          +15%
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-2 font-medium">Coaching</td>
                        <td className="text-right py-3 px-2">$8,200</td>
                        <td className="text-right py-3 px-2">68</td>
                        <td className="text-right py-3 px-2">$120</td>
                        <td className="text-right py-3 px-2 text-green-600">
                          +8%
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-2 font-medium">Workshop</td>
                        <td className="text-right py-3 px-2">$5,750</td>
                        <td className="text-right py-3 px-2">46</td>
                        <td className="text-right py-3 px-2">$125</td>
                        <td className="text-right py-3 px-2 text-red-600">
                          -3%
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-2 font-medium">Follow-up</td>
                        <td className="text-right py-3 px-2">$2,100</td>
                        <td className="text-right py-3 px-2">35</td>
                        <td className="text-right py-3 px-2">$60</td>
                        <td className="text-right py-3 px-2 text-green-600">
                          +5%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
