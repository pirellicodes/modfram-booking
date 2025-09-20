"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Availability } from "@/components/Availability";
import { BookingCalendar } from "@/components/calendar/BookingCalendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBookings } from "@/hooks/use-bookings";
import { toCalendarEvents } from "@/lib/calendar-adapters";
import { Events } from "@/types/event";

export default function AvailabilityPage() {
  const { data: bookings, loading, error, refetch } = useBookings();
  const [currentRange, setCurrentRange] = useState({
    start: new Date().toISOString(),
    end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  });

  // Transform bookings to calendar events
  const events: Events[] = useMemo(() => {
    if (!bookings || bookings.length === 0) return [];
    return toCalendarEvents(bookings) as Events[];
  }, [bookings]);

  const handleCreateBooking = async (payload: any) => {
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create booking");
      }

      toast.success("Booking created successfully");

      // Refetch bookings to update the calendar
      if (refetch) {
        await refetch();
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create booking"
      );
    }
  };

  const handleRangeChange = (range: { start: string; end: string }) => {
    setCurrentRange(range);
    // Here you could refetch data for the new range if needed
  };

  return (
    <div className="py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Availability</h1>
        <p className="text-muted-foreground">
          Manage your weekly schedule and booking availability.
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
          <BookingCalendar
            mode="availability"
            events={events}
            initialRange={currentRange}
            onCreateBooking={handleCreateBooking}
            onRangeChange={handleRangeChange}
            loading={loading}
            error={error}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
