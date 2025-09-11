"use client";

import { Bookings } from "@/components/Bookings";

export default function BookingsPage() {
  return (
    <div className="py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
        <p className="text-muted-foreground">
          View and manage all your photography session bookings.
        </p>
      </div>
      <Bookings />
    </div>
  );
}
