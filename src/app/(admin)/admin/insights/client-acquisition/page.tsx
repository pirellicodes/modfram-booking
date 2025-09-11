"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ClientAcquisitionChart } from "@/components/charts/ClientAcquisitionChart";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, Download, RefreshCw, TrendingUp, UserPlus, Repeat } from "lucide-react";

export default function ClientAcquisitionPage() {
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
                  Track new vs returning client patterns to understand customer loyalty
                  and acquisition effectiveness.
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
                  <Users className="h-5 w-5" />
                  Client Acquisition Analysis
                </CardTitle>
                <CardDescription>
                  Daily comparison of new client acquisitions vs returning client bookings
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[500px]">
                <ClientAcquisitionChart />
              </CardContent>
            </Card>

            {/* Client Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    New Clients
                  </CardTitle>
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">142</div>
                  <p className="text-xs text-muted-foreground">
                    This month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Returning Clients
                  </CardTitle>
                  <Repeat className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">89</div>
                  <p className="text-xs text-muted-foreground">
                    This month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Retention Rate
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">62.7%</div>
                  <p className="text-xs text-muted-foreground">
                    +5% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Acquisition Rate
                  </CardTitle>
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4.7</div>
                  <p className="text-xs text-muted-foreground">
                    New clients/day
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Client Acquisition Trends */}
            <div className="grid gap-6 md:grid-cols-2 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Acquisition Sources</CardTitle>
                  <CardDescription>
                    How new clients discover your services
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Referrals</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded">
                          <div className="w-3/5 h-2 bg-blue-500 rounded"></div>
                        </div>
                        <span className="text-sm text-muted-foreground">45%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Website</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded">
                          <div className="w-1/3 h-2 bg-green-500 rounded"></div>
                        </div>
                        <span className="text-sm text-muted-foreground">28%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Social Media</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded">
                          <div className="w-1/5 h-2 bg-purple-500 rounded"></div>
                        </div>
                        <span className="text-sm text-muted-foreground">18%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Search Engines</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded">
                          <div className="w-1/12 h-2 bg-orange-500 rounded"></div>
                        </div>
                        <span className="text-sm text-muted-foreground">9%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Client Lifecycle</CardTitle>
                  <CardDescription>
                    Average client engagement patterns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted rounded">
                      <div>
                        <div className="font-medium">First Session</div>
                        <div className="text-sm text-muted-foreground">Initial engagement</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">100%</div>
                        <div className="text-xs text-muted-foreground">baseline</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded">
                      <div>
                        <div className="font-medium">Second Session</div>
                        <div className="text-sm text-muted-foreground">Return rate</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">68%</div>
                        <div className="text-xs text-muted-foreground">clients return</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded">
                      <div>
                        <div className="font-medium">Long-term (5+)</div>
                        <div className="text-sm text-muted-foreground">Loyal clients</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">23%</div>
                        <div className="text-xs text-muted-foreground">retention</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Client Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Client Cohort Analysis</CardTitle>
                <CardDescription>
                  Monthly breakdown of new client acquisitions and retention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2">Month</th>
                        <th className="text-right py-3 px-2">New Clients</th>
                        <th className="text-right py-3 px-2">Returning Clients</th>
                        <th className="text-right py-3 px-2">Total Sessions</th>
                        <th className="text-right py-3 px-2">Retention Rate</th>
                        <th className="text-right py-3 px-2">Growth</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 px-2 font-medium">January 2024</td>
                        <td className="text-right py-3 px-2">45</td>
                        <td className="text-right py-3 px-2">32</td>
                        <td className="text-right py-3 px-2">89</td>
                        <td className="text-right py-3 px-2">71.1%</td>
                        <td className="text-right py-3 px-2 text-green-600">+12%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-2 font-medium">February 2024</td>
                        <td className="text-right py-3 px-2">38</td>
                        <td className="text-right py-3 px-2">41</td>
                        <td className="text-right py-3 px-2">95</td>
                        <td className="text-right py-3 px-2">51.9%</td>
                        <td className="text-right py-3 px-2 text-red-600">-15%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-2 font-medium">March 2024</td>
                        <td className="text-right py-3 px-2">52</td>
                        <td className="text-right py-3 px-2">48</td>
                        <td className="text-right py-3 px-2">124</td>
                        <td className="text-right py-3 px-2">52.0%</td>
                        <td className="text-right py-3 px-2 text-green-600">+37%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-2 font-medium">April 2024</td>
                        <td className="text-right py-3 px-2">47</td>
                        <td className="text-right py-3 px-2">62</td>
                        <td className="text-right py-3 px-2">138</td>
                        <td className="text-right py-3 px-2">56.9%</td>
                        <td className="text-right py-3 px-2 text-green-600">+11%</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-2 font-medium">May 2024 (Current)</td>
                        <td className="text-right py-3 px-2">43</td>
                        <td className="text-right py-3 px-2">89</td>
                        <td className="text-right py-3 px-2">156</td>
                        <td className="text-right py-3 px-2">62.7%</td>
                        <td className="text-right py-3 px-2 text-green-600">+13%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Insights and Recommendations */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Client Acquisition Insights</CardTitle>
                <CardDescription>
                  Key insights and actionable recommendations for client growth
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                      Strong Referral Network
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      45% of new clients come from referrals, indicating high client satisfaction.
                      Consider implementing a formal referral program to boost this further.
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                      Improving Retention Rates
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Retention rate has improved to 62.7% (+5% from last month). Focus on
                      maintaining this upward trend through personalized follow-up strategies.
                    </p>
                  </div>

                  <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-2">
                      Digital Acquisition Opportunity
                    </h4>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      Only 9% of clients come from search engines. Investing in SEO and
                      digital marketing could significantly increase your client base.
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
