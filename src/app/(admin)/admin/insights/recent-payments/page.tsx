"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { RecentPayments } from "@/components/charts/RecentPayments";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreditCard, Download, RefreshCw, DollarSign, TrendingUp, AlertCircle } from "lucide-react";

export default function RecentPaymentsPage() {
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
                  Monitor and analyze recent payment transactions to track revenue
                  patterns and payment processing health.
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

            {/* Payment Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Today&apos;s Revenue
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$2,450</div>
                  <p className="text-xs text-muted-foreground">
                    +12% from yesterday
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Successful Payments
                  </CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">18</div>
                  <p className="text-xs text-muted-foreground">
                    Today
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Average Payment
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$136</div>
                  <p className="text-xs text-muted-foreground">
                    +$8 from last week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Failed Payments
                  </CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2</div>
                  <p className="text-xs text-muted-foreground">
                    0.1% failure rate
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Payment Status Overview */}
            <div className="grid gap-6 md:grid-cols-2 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>
                    Breakdown by payment method
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Credit Card</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded">
                          <div className="w-4/5 h-2 bg-blue-500 rounded"></div>
                        </div>
                        <span className="text-sm text-muted-foreground">78%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">PayPal</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded">
                          <div className="w-1/6 h-2 bg-green-500 rounded"></div>
                        </div>
                        <span className="text-sm text-muted-foreground">15%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Bank Transfer</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded">
                          <div className="w-1/12 h-2 bg-purple-500 rounded"></div>
                        </div>
                        <span className="text-sm text-muted-foreground">7%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Trends</CardTitle>
                  <CardDescription>
                    Recent payment activity patterns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-800">
                      <div>
                        <div className="font-medium text-green-900 dark:text-green-100">Peak Hours</div>
                        <div className="text-sm text-green-700 dark:text-green-300">2-4 PM most active</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-900 dark:text-green-100">65%</div>
                        <div className="text-xs text-green-600">daily volume</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800">
                      <div>
                        <div className="font-medium text-blue-900 dark:text-blue-100">Weekly Pattern</div>
                        <div className="text-sm text-blue-700 dark:text-blue-300">Tuesday-Thursday peak</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-blue-900 dark:text-blue-100">+23%</div>
                        <div className="text-xs text-blue-600">vs weekends</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 rounded border border-orange-200 dark:border-orange-800">
                      <div>
                        <div className="font-medium text-orange-900 dark:text-orange-100">Processing Time</div>
                        <div className="text-sm text-orange-700 dark:text-orange-300">Average settlement</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-orange-900 dark:text-orange-100">1.2s</div>
                        <div className="text-xs text-orange-600">avg time</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Payments Table */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Recent Payment Transactions
                </CardTitle>
                <CardDescription>
                  Latest successful payment transactions from your clients
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[600px] overflow-auto">
                <RecentPayments />
              </CardContent>
            </Card>

            {/* Payment Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Performance Analysis</CardTitle>
                <CardDescription>
                  Detailed breakdown of recent payment activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2">Time Period</th>
                        <th className="text-right py-3 px-2">Total Volume</th>
                        <th className="text-right py-3 px-2">Success Rate</th>
                        <th className="text-right py-3 px-2">Avg Amount</th>
                        <th className="text-right py-3 px-2">Failed</th>
                        <th className="text-right py-3 px-2">Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 px-2 font-medium">Today</td>
                        <td className="text-right py-3 px-2">$2,450</td>
                        <td className="text-right py-3 px-2">
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">95%</span>
                        </td>
                        <td className="text-right py-3 px-2">$136</td>
                        <td className="text-right py-3 px-2">2</td>
                        <td className="text-right py-3 px-2 text-green-600">+12%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-2 font-medium">Yesterday</td>
                        <td className="text-right py-3 px-2">$2,187</td>
                        <td className="text-right py-3 px-2">
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">97%</span>
                        </td>
                        <td className="text-right py-3 px-2">$128</td>
                        <td className="text-right py-3 px-2">1</td>
                        <td className="text-right py-3 px-2 text-green-600">+8%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-2 font-medium">This Week</td>
                        <td className="text-right py-3 px-2">$14,230</td>
                        <td className="text-right py-3 px-2">
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">96%</span>
                        </td>
                        <td className="text-right py-3 px-2">$132</td>
                        <td className="text-right py-3 px-2">8</td>
                        <td className="text-right py-3 px-2 text-green-600">+15%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-2 font-medium">Last Week</td>
                        <td className="text-right py-3 px-2">$12,380</td>
                        <td className="text-right py-3 px-2">
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">94%</span>
                        </td>
                        <td className="text-right py-3 px-2">$124</td>
                        <td className="text-right py-3 px-2">12</td>
                        <td className="text-right py-3 px-2 text-green-600">+3%</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-2 font-medium">This Month</td>
                        <td className="text-right py-3 px-2">$58,920</td>
                        <td className="text-right py-3 px-2">
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">95%</span>
                        </td>
                        <td className="text-right py-3 px-2">$130</td>
                        <td className="text-right py-3 px-2">31</td>
                        <td className="text-right py-3 px-2 text-green-600">+18%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Payment Insights */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Payment Processing Insights</CardTitle>
                <CardDescription>
                  Key insights and recommendations for payment optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                      High Success Rate
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Your payment success rate of 95% is excellent, indicating smooth payment processing
                      and good client payment method health.
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                      Credit Card Preference
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      78% of clients prefer credit card payments. Consider optimizing the credit card
                      checkout experience and potentially offering incentives for this method.
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                      Peak Processing Times
                    </h4>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      65% of daily payment volume occurs between 2-4 PM. Ensure payment infrastructure
                      can handle peak loads during these hours.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
