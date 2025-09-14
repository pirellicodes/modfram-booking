"use client";

import {
  CalendarIcon,
  ClockIcon,
  DollarSignIcon,
  UsersIcon,
} from "lucide-react";

import { Overview } from "@/components/dashboard/overview";
import { RecentActivities } from "@/components/dashboard/recent-activities";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDashboardStats } from "@/hooks/use-dashboard-data";

function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{trend || description}</p>
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
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total Revenue"
              value={loading ? "..." : formatCurrency(stats.totalRevenue)}
              description="All time revenue"
              icon={DollarSignIcon}
              trend="+20.1% from last month"
            />
            <StatsCard
              title="Total Bookings"
              value={loading ? "..." : stats.totalBookings}
              description="Active bookings"
              icon={CalendarIcon}
              trend="+180.1% from last month"
            />
            <StatsCard
              title="Total Clients"
              value={loading ? "..." : stats.totalClients}
              description="Registered clients"
              icon={UsersIcon}
              trend="+19% from last month"
            />
            <StatsCard
              title="Upcoming Sessions"
              value={loading ? "..." : stats.upcomingBookings}
              description="Next 30 days"
              icon={ClockIcon}
              trend="+201 since last hour"
            />
          </div>

          {/* Main Charts */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <Overview />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
                <CardDescription>
                  You made 265 sales this month.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentActivities />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Conversion Rate"
              value="87.3%"
              description="Booking conversion rate"
              icon={CalendarIcon}
              trend="+5.2% from last month"
            />
            <StatsCard
              title="Average Session Value"
              value="$1,248"
              description="Per session revenue"
              icon={DollarSignIcon}
              trend="+12.5% from last month"
            />
            <StatsCard
              title="Customer Retention"
              value="92.1%"
              description="Returning customers"
              icon={UsersIcon}
              trend="+2.1% from last month"
            />
            <StatsCard
              title="Session Rating"
              value="4.8"
              description="Average rating"
              icon={ClockIcon}
              trend="+0.2 from last month"
            />
          </div>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Analytics Overview</CardTitle>
                <CardDescription>Monthly performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <Overview />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Top Performing Sessions</CardTitle>
                <CardDescription>Best converting session types</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Wedding Photography
                    </p>
                    <p className="text-sm text-muted-foreground">
                      $2,500 avg value
                    </p>
                  </div>
                  <div className="ml-auto font-medium">45%</div>
                </div>
                <div className="flex items-center">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Portrait Sessions
                    </p>
                    <p className="text-sm text-muted-foreground">
                      $850 avg value
                    </p>
                  </div>
                  <div className="ml-auto font-medium">32%</div>
                </div>
                <div className="flex items-center">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Corporate Events
                    </p>
                    <p className="text-sm text-muted-foreground">
                      $1,200 avg value
                    </p>
                  </div>
                  <div className="ml-auto font-medium">23%</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>
                Generate and download detailed business reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Financial Reports</h4>
                  <div className="space-y-2">
                    <div className="w-full p-3 border rounded-lg text-left text-sm">
                      Monthly Revenue Report
                    </div>
                    <div className="w-full p-3 border rounded-lg text-left text-sm">
                      Tax Summary Report
                    </div>
                    <div className="w-full p-3 border rounded-lg text-left text-sm">
                      Profit & Loss Statement
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Booking Reports</h4>
                  <div className="space-y-2">
                    <div className="w-full p-3 border rounded-lg text-left text-sm">
                      Booking Summary
                    </div>
                    <div className="w-full p-3 border rounded-lg text-left text-sm">
                      Client Activity Report
                    </div>
                    <div className="w-full p-3 border rounded-lg text-left text-sm">
                      Session Performance
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
              <CardDescription>
                Stay updated with your business activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">New booking received</p>
                    <p className="text-xs text-muted-foreground">
                      Emily Johnson booked a wedding session for June 15th
                    </p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 mt-2 bg-green-500 rounded-full"></div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Payment received</p>
                    <p className="text-xs text-muted-foreground">
                      $1,250 payment confirmed for David Wilson&apos;s session
                    </p>
                    <p className="text-xs text-muted-foreground">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 mt-2 bg-yellow-500 rounded-full"></div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Session reminder</p>
                    <p className="text-xs text-muted-foreground">
                      Portrait session with Sarah Davis tomorrow at 2 PM
                    </p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
