"use client";

import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  DollarSign,
  Target,
  TrendingUp,
  Users,
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

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendDirection,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  trend: string;
  trendDirection: "up" | "down";
}) {
  const TrendIcon = trendDirection === "up" ? ArrowUpRight : ArrowDownRight;
  const trendColor =
    trendDirection === "up" ? "text-green-600" : "text-red-600";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center pt-1">
          <TrendIcon className={`h-4 w-4 mr-1 ${trendColor}`} />
          <span className={`text-xs ${trendColor}`}>{trend}</span>
          <span className="text-xs text-muted-foreground ml-1">
            {description}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

const InsightCard = ({
  title,
  items,
}: {
  title: string;
  items: { label: string; value: string; percentage: number }[];
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-base">{title}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{item.label}</span>
            <span className="font-medium">{item.value}</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${item.percentage}%` }}
            />
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
);

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
        <p className="text-muted-foreground">
          Deep dive into your photography business performance and insights.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Conversion Rate"
              value="87.3%"
              description="from last month"
              icon={Target}
              trend="+5.2%"
              trendDirection="up"
            />
            <MetricCard
              title="Client Retention"
              value="92.1%"
              description="from last month"
              icon={Users}
              trend="+2.1%"
              trendDirection="up"
            />
            <MetricCard
              title="Avg Session Value"
              value="$1,248"
              description="from last month"
              icon={DollarSign}
              trend="+12.5%"
              trendDirection="up"
            />
            <MetricCard
              title="Monthly Growth"
              value="23.4%"
              description="from last month"
              icon={Activity}
              trend="+3.1%"
              trendDirection="up"
            />
          </div>

          {/* Main Charts */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>
                  Monthly revenue performance over time
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <Overview />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest payment activities</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentActivities />
              </CardContent>
            </Card>
          </div>

          {/* Business Insights */}
          <div className="grid gap-4 md:grid-cols-3">
            <InsightCard
              title="Popular Session Types"
              items={[
                { label: "Wedding Photography", value: "45%", percentage: 45 },
                { label: "Portrait Sessions", value: "32%", percentage: 32 },
                { label: "Corporate Events", value: "23%", percentage: 23 },
              ]}
            />
            <InsightCard
              title="Peak Booking Times"
              items={[
                { label: "Saturday Afternoons", value: "45%", percentage: 45 },
                { label: "Sunday Mornings", value: "32%", percentage: 32 },
                { label: "Weekend Evenings", value: "23%", percentage: 23 },
              ]}
            />
            <InsightCard
              title="Client Demographics"
              items={[
                { label: "25-35 years", value: "42%", percentage: 42 },
                { label: "36-45 years", value: "35%", percentage: 35 },
                { label: "18-24 years", value: "23%", percentage: 23 },
              ]}
            />
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Session Rating"
              value="4.8/5"
              description="avg rating"
              icon={Target}
              trend="+0.2"
              trendDirection="up"
            />
            <MetricCard
              title="Response Time"
              value="2.3h"
              description="avg response"
              icon={Activity}
              trend="-0.5h"
              trendDirection="up"
            />
            <MetricCard
              title="Booking Success"
              value="94.2%"
              description="success rate"
              icon={Calendar}
              trend="+1.8%"
              trendDirection="up"
            />
            <MetricCard
              title="Referral Rate"
              value="38.5%"
              description="from referrals"
              icon={Users}
              trend="+4.2%"
              trendDirection="up"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>
                  Key performance indicators for your business
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <Overview />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Quality Metrics</CardTitle>
                <CardDescription>
                  Customer satisfaction and service quality
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Customer Satisfaction
                    </span>
                    <span className="text-sm">96%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: "96%" }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      On-Time Delivery
                    </span>
                    <span className="text-sm">94%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: "94%" }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Repeat Customers
                    </span>
                    <span className="text-sm">87%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: "87%" }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Clients"
              value="1,247"
              description="registered clients"
              icon={Users}
              trend="+89"
              trendDirection="up"
            />
            <MetricCard
              title="Active Clients"
              value="892"
              description="in last 6 months"
              icon={Activity}
              trend="+23%"
              trendDirection="up"
            />
            <MetricCard
              title="New Clients"
              value="156"
              description="this month"
              icon={TrendingUp}
              trend="+12%"
              trendDirection="up"
            />
            <MetricCard
              title="Client Lifetime Value"
              value="$3,420"
              description="average CLV"
              icon={DollarSign}
              trend="+8.5%"
              trendDirection="up"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Client Acquisition</CardTitle>
                <CardDescription>
                  How clients discover your business
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <InsightCard
                  title=""
                  items={[
                    { label: "Social Media", value: "45%", percentage: 45 },
                    { label: "Referrals", value: "38%", percentage: 38 },
                    { label: "Website", value: "17%", percentage: 17 },
                  ]}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Client Retention</CardTitle>
                <CardDescription>
                  Client engagement and retention metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentActivities />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Monthly Revenue"
              value="$24,580"
              description="this month"
              icon={DollarSign}
              trend="+15.3%"
              trendDirection="up"
            />
            <MetricCard
              title="Average Order Value"
              value="$1,450"
              description="per booking"
              icon={Target}
              trend="+8.7%"
              trendDirection="up"
            />
            <MetricCard
              title="Revenue Growth"
              value="28.4%"
              description="YoY growth"
              icon={TrendingUp}
              trend="+5.2%"
              trendDirection="up"
            />
            <MetricCard
              title="Profit Margin"
              value="42.8%"
              description="gross margin"
              icon={Activity}
              trend="+2.1%"
              trendDirection="up"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>
                Monthly revenue trends and projections
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <Overview />
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <InsightCard
              title="Revenue by Session Type"
              items={[
                {
                  label: "Wedding Photography",
                  value: "$15,240",
                  percentage: 62,
                },
                { label: "Corporate Events", value: "$5,890", percentage: 24 },
                { label: "Portrait Sessions", value: "$3,450", percentage: 14 },
              ]}
            />
            <InsightCard
              title="Monthly Breakdown"
              items={[
                { label: "Session Fees", value: "$18,200", percentage: 74 },
                { label: "Add-on Services", value: "$4,380", percentage: 18 },
                { label: "Prints & Products", value: "$2,000", percentage: 8 },
              ]}
            />
            <InsightCard
              title="Payment Methods"
              items={[
                { label: "Credit Card", value: "68%", percentage: 68 },
                { label: "Bank Transfer", value: "24%", percentage: 24 },
                { label: "PayPal", value: "8%", percentage: 8 },
              ]}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
