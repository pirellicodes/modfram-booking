"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRecentPayments } from "@/hooks/use-dashboard-data";

export function RecentActivities() {
  const { data: payments, loading } = useRecentPayments(5);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 animate-pulse">
            <div className="w-9 h-9 bg-gray-200 rounded-full" />
            <div className="space-y-1 flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
            <div className="h-4 bg-gray-200 rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (!payments.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {payments.map((payment) => {
        const clientName =
          (payment.bookings as any)?.clients?.name ||
          (payment.bookings as any)?.client?.name ||
          "Unknown Client";
        const sessionType = payment.bookings?.session_type || "Unknown Session";
        const amount = payment.amount_cents / 100;

        // Get client initials
        const initials = clientName
          .split(" ")
          .map((name: any) => name[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        return (
          <div key={payment.id} className="flex items-center space-x-4">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-1 flex-1 min-w-0">
              <p className="text-sm font-medium leading-none truncate">
                {clientName}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {String(sessionType || "")}
              </p>
            </div>
            <div className="font-medium">+${amount.toFixed(2)}</div>
          </div>
        );
      })}
    </div>
  );
}
