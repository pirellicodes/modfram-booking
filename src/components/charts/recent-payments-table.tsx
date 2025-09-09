"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const recentPayments = [
  {
    id: "1",
    client: "Sarah Johnson",
    email: "sarah.j@example.com",
    service: "1-on-1 Training",
    amount: 150.00,
    status: "Completed",
    date: "2024-03-15",
  },
  {
    id: "2",
    client: "Michael Chen",
    email: "m.chen@example.com",
    service: "Group Class",
    amount: 85.00,
    status: "Completed",
    date: "2024-03-14",
  },
  {
    id: "3",
    client: "Emma Davis",
    email: "emma.d@example.com",
    service: "Workshop",
    amount: 200.00,
    status: "Pending",
    date: "2024-03-13",
  },
  {
    id: "4",
    client: "James Wilson",
    email: "j.wilson@example.com",
    service: "Online Session",
    amount: 120.00,
    status: "Completed",
    date: "2024-03-12",
  },
  {
    id: "5",
    client: "Lisa Anderson",
    email: "lisa.a@example.com",
    service: "1-on-1 Training",
    amount: 150.00,
    status: "Failed",
    date: "2024-03-11",
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Completed":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
    case "Pending":
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
    case "Failed":
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Failed</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export function RecentPaymentsTable() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>
            Latest payment transactions from clients
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 text-sm border rounded-md hover:bg-gray-50">
            Filter
          </button>
          <button className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800">
            See all
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2 font-medium text-sm text-muted-foreground">
                  Client
                </th>
                <th className="text-left py-3 px-2 font-medium text-sm text-muted-foreground">
                  Service
                </th>
                <th className="text-left py-3 px-2 font-medium text-sm text-muted-foreground">
                  Amount
                </th>
                <th className="text-left py-3 px-2 font-medium text-sm text-muted-foreground">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.map((payment) => (
                <tr key={payment.id} className="border-b last:border-b-0">
                  <td className="py-4 px-2">
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">
                        {payment.client}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {payment.email}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex flex-col">
                      <span className="text-sm">{payment.service}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(payment.date).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <span className="font-medium text-sm">
                      ${payment.amount.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-4 px-2">
                    {getStatusBadge(payment.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
