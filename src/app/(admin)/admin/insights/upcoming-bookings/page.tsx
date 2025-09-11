"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { UpcomingBookingsChart } from "@/components/charts/UpcomingBookingsChart";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Download, RefreshCw, Clock, Users, AlertCircle } from "lucide-react";

export default function UpcomingBookingsPage() {
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
                  Monitor and manage your upcoming bookings for the next 30 days
                  to optimize scheduling and resource allocation.
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
                  <Calendar className="h-5 w-5" />
                  Upcoming Bookings Breakdown
                </CardTitle>
                <CardDescription>
                  Distribution of bookings scheduled for the next 30 days
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[500px]">
                <UpcomingBookingsChart />
              </CardContent>
            </Card>

            {/* Booking Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Upcoming
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">68</div>
                  <p className="text-xs text-muted-foreground">
                    Next 30 days
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    This Week
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">18</div>
                  <p className="text-xs text-muted-foreground">
                    +3 from last week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Unique Clients
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">45</div>
                  <p className="text-xs text-muted-foreground">
                    Active clients
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Capacity Used
                  </CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">72%</div>
                  <p className="text-xs text-muted-foreground">
                    Of available slots
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Breakdown */}
            <div className="grid gap-6 md:grid-cols-2 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Distribution</CardTitle>
                  <CardDescription>
                    Bookings scheduled by week
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Week 1</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded">
                          <div className="w-3/4 h-2 bg-primary rounded"></div>
                        </div>
                        <span className="text-sm text-muted-foreground">18</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Week 2</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded">
                          <div className="w-2/3 h-2 bg-primary rounded"></div>
                        </div>
                        <span className="text-sm text-muted-foreground">16</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Week 3</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded">
                          <div className="w-1/2 h-2 bg-primary rounded"></div>
                        </div>
                        <span className="text-sm text-muted-foreground">12</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Week 4</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded">
                          <div className="w-5/12 h-2 bg-primary rounded"></div>
                        </div>
                        <span className="text-sm text-muted-foreground">10</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Week 5+</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded">
                          <div className="w-1/3 h-2 bg-primary rounded"></div>
                        </div>
                        <span className="text-sm text-muted-foreground">12</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Peak Days</CardTitle>
                  <CardDescription>
                    Days with highest booking density
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted rounded">
                      <div>
                        <div className="font-medium">Tuesday</div>
                        <div className="text-sm text-muted-foreground">Peak day</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">15</div>
                        <div className="text-xs text-muted-foreground">bookings</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded">
                      <div>
                        <div className="font-medium">Thursday</div>
                        <div className="text-sm text-muted-foreground">High activity</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">12</div>
                        <div className="text-xs text-muted-foreground">bookings</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded">
                      <div>
                        <div className="font-medium">Wednesday</div>
                        <div className="text-sm text-muted-foreground">Busy day</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">11</div>
                        <div className="text-xs text-muted-foreground">bookings</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Bookings List */}
            <Card>
              <CardHeader>
                <CardTitle>Next 7 Days</CardTitle>
                <CardDescription>
                  Detailed view of bookings in the upcoming week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2">Date</th>
                        <th className="text-left py-3 px-2">Time</th>
                        <th className="text-left py-3 px-2">Client</th>
                        <th className="text-left py-3 px-2">Session Type</th>
                        <th className="text-left py-3 px-2">Category</th>
                        <th className="text-right py-3 px-2">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 px-2 font-medium">Today</td>
                        <td className="py-3 px-2">2:00 PM</td>
                        <td className="py-3 px-2">Sarah Johnson</td>
                        <td className="py-3 px-2">Consultation</td>
                        <td className="py-3 px-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Business</span>
                        </td>
                        <td className="text-right py-3 px-2">$150</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-2 font-medium">Today</td>
                        <td className="py-3 px-2">4:30 PM</td>
                        <td className="py-3 px-2">Michael Chen</td>
                        <td className="py-3 px-2">Coaching</td>
                        <td className="py-3 px-2">
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Health</span>
                        </td>
                        <td className="text-right py-3 px-2">$120</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-2 font-medium">Tomorrow</td>
                        <td className="py-3 px-2">10:00 AM</td>
                        <td className="py-3 px-2">Emma Davis</td>
                        <td className="py-3 px-2">Workshop</td>
                        <td className="py-3 px-2">
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">Creative</span>
                        </td>
                        <td className="text-right py-3 px-2">$200</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-2 font-medium">Tomorrow</td>
                        <td className="py-3 px-2">1:15 PM</td>
                        <td className="py-3 px-2">Alex Rodriguez</td>
                        <td className="py-3 px-2">Follow-up</td>
                        <td className="py-3 px-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Business</span>
                        </td>
                        <td className="text-right py-3 px-2">$60</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-2 font-medium">Thursday</td>
                        <td className="py-3 px-2">9:30 AM</td>
                        <td className="py-3 px-2">Lisa Park</td>
                        <td className="py-3 px-2">Consultation</td>
                        <td className="py-3 px-2">
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">Technology</span>
                        </td>
                        <td className="text-right py-3 px-2">$180</td>
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
