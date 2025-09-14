"use client";

import React, { useMemo, useState } from "react";

import { EventCalendar } from "@/components/event-calendar/event-calendar";
import { useBookings } from "@/hooks/use-bookings";
import { toCalendarEvents } from "@/lib/calendar-adapters";
import { Events } from "@/types/event";

export function Calendar() {
  const { data: bookings, loading, error } = useBookings();

  // Transform Supabase bookings to EventCalendar format
  const events: Events[] = useMemo(() => {
    if (!bookings || bookings.length === 0) return [];
    return toCalendarEvents(bookings) as Events[];
  }, [bookings]);

  const [currentDate, setCurrentDate] = useState(new Date());

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-muted-foreground">Error loading calendar events</p>
          <p className="text-sm text-muted-foreground mt-2">{error}</p>
          <button
            onClick={() =>
              typeof window !== "undefined" && window.location.reload()
            }
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Plain function since we don't need memoization here
  const handleDateChange = (date: Date) => setCurrentDate(date);

  return (
    <div className="w-full">
      {events.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center h-96 bg-background border rounded-xl shadow-sm">
          <p className="text-muted-foreground">No bookings found</p>
          <p className="text-sm text-muted-foreground mt-2">
            Your calendar is currently empty
          </p>
        </div>
      ) : (
        <EventCalendar
          events={events}
          initialDate={currentDate}
          onDateChange={handleDateChange}
        />
      )}
    </div>
  );
}
