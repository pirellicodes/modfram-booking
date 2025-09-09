"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const sales = [
  {
    name: "John Doe",
    email: "john@example.com",
    amount: "$250.00",
    initials: "JD",
  },
  {
    name: "Alice Smith",
    email: "alice@example.com",
    amount: "$350.00",
    initials: "AS",
  },
  {
    name: "Bob Johnson",
    email: "bob@example.com",
    amount: "$175.00",
    initials: "BJ",
  },
  {
    name: "Emma Wilson",
    email: "emma@example.com",
    amount: "$425.00",
    initials: "EW",
  },
  {
    name: "Michael Brown",
    email: "michael@example.com",
    amount: "$550.00",
    initials: "MB",
  },
]

export function RecentSales() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Sales</CardTitle>
        <CardDescription>Last 5 sales transactions.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {sales.map((sale) => (
            <div key={sale.email} className="flex items-center">
              <Avatar className="size-9">
                <AvatarFallback>{sale.initials}</AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">{sale.name}</p>
                <p className="text-sm text-muted-foreground">{sale.email}</p>
              </div>
              <div className="ml-auto font-medium">{sale.amount}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
