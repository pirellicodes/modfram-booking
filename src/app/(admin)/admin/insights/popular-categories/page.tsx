"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PopularSessionCategoriesChart } from "@/components/charts/PopularSessionCategoriesChart";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PieChart, Download, RefreshCw, TrendingUp, Users } from "lucide-react";

export default function PopularCategoriesPage() {
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
                  Discover which session categories are most popular among your clients
                  to optimize your service offerings.
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
                  <PieChart className="h-5 w-5" />
                  Popular Session Categories
                </CardTitle>
                <CardDescription>
                  Distribution of bookings across different session categories
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[500px]">
                <PopularSessionCategoriesChart />
              </CardContent>
            </Card>

            {/* Category Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Most Popular Category
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Business</div>
                  <p className="text-xs text-muted-foreground">
                    45% of all bookings
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Categories
                  </CardTitle>
                  <PieChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">
                    Active categories
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Category Diversity
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">72%</div>
                  <p className="text-xs text-muted-foreground">
                    Distribution score
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Fastest Growing
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Health</div>
                  <p className="text-xs text-muted-foreground">
                    +28% this month
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Category Performance Table */}
            <Card>
              <CardHeader>
                <CardTitle>Category Performance Details</CardTitle>
                <CardDescription>
                  Comprehensive breakdown of booking performance by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2">Category</th>
                        <th className="text-right py-3 px-2">Bookings</th>
                        <th className="text-right py-3 px-2">Percentage</th>
                        <th className="text-right py-3 px-2">Revenue</th>
                        <th className="text-right py-3 px-2">Growth</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span className="font-medium">Business</span>
                          </div>
                        </td>
                        <td className="text-right py-3 px-2">156</td>
                        <td className="text-right py-3 px-2">45.2%</td>
                        <td className="text-right py-3 px-2">$18,200</td>
                        <td className="text-right py-3 px-2 text-green-600">+12%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="font-medium">Health</span>
                          </div>
                        </td>
                        <td className="text-right py-3 px-2">89</td>
                        <td className="text-right py-3 px-2">25.8%</td>
                        <td className="text-right py-3 px-2">$10,650</td>
                        <td className="text-right py-3 px-2 text-green-600">+28%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                            <span className="font-medium">Personal Development</span>
                          </div>
                        </td>
                        <td className="text-right py-3 px-2">52</td>
                        <td className="text-right py-3 px-2">15.1%</td>
                        <td className="text-right py-3 px-2">$6,240</td>
                        <td className="text-right py-3 px-2 text-green-600">+5%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                            <span className="font-medium">Technology</span>
                          </div>
                        </td>
                        <td className="text-right py-3 px-2">28</td>
                        <td className="text-right py-3 px-2">8.1%</td>
                        <td className="text-right py-3 px-2">$4,200</td>
                        <td className="text-right py-3 px-2 text-red-600">-8%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                            <span className="font-medium">Creative</span>
                          </div>
                        </td>
                        <td className="text-right py-3 px-2">21</td>
                        <td className="text-right py-3 px-2">6.1%</td>
                        <td className="text-right py-3 px-2">$2,520</td>
                        <td className="text-right py-3 px-2 text-green-600">+15%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Insights and Recommendations */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Category Insights</CardTitle>
                <CardDescription>
                  Key insights and recommendations based on category performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                      Business Category Dominance
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Business consultations represent nearly half of all bookings. Consider expanding
                      your business service offerings or increasing capacity for this category.
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                      Health Category Growth
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Health sessions show the strongest growth at +28%. This trend suggests
                      increasing demand for wellness and health-related services.
                    </p>
                  </div>

                  <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-2">
                      Technology Category Decline
                    </h4>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      Technology sessions declined by 8%. Consider reviewing pricing,
                      marketing approach, or service content for this category.
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
