"use client";

import { EventTypes } from "@/components/EventTypes";

export default function EventTypesPage() {
  return (
    <div className="py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Event Types</h1>
        <p className="text-muted-foreground">
          Create and manage different types of photography sessions you offer.
        </p>
      </div>
      <EventTypes />
    </div>
  );
}
