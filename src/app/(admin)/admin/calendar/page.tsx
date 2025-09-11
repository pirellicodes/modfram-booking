"use client";

import { Calendar } from "@/components/Calendar";

export default function CalendarPage() {
  return (
    <div className="py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
        <p className="text-muted-foreground">
          View and manage all your bookings in calendar format.
        </p>
      </div>
      <Calendar />
    </div>
  );
}
