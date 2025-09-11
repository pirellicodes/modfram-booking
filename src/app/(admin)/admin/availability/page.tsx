"use client";

import { Availability } from "@/components/Availability";

export default function AvailabilityPage() {
  return (
    <div className="py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Availability</h1>
        <p className="text-muted-foreground">
          Set your weekly schedule and manage your booking availability.
        </p>
      </div>
      <Availability />
    </div>
  );
}
