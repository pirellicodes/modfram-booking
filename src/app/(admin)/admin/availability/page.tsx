"use client";

import { EventCalendar } from "@/components/event-calendar/event-calendar";
import { Availability } from "@/components/Availability";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useMemo } from "react";
import { Events } from "@/types/event";

export default function AvailabilityPage() {
  const [currentDate] = useState(new Date());

  // Create availability slots as events for calendar view
  const availabilityEvents: Events[] = useMemo(() => {
    // This would come from your availability data
    // For now, return empty array - will be populated by availability data
    return [];
  }, []);

  return (
    <div className="py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Availability</h1>
        <p className="text-muted-foreground">
          Set your weekly schedule and manage your booking availability.
        </p>
      </div>

      <Tabs defaultValue="schedule" className="space-y-6">
        <TabsList>
          <TabsTrigger value="schedule">Weekly Schedule</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-6">
          <Availability />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <EventCalendar
            events={availabilityEvents}
            initialDate={currentDate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
