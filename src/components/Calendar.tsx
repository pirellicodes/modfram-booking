"use client";

import React, { useMemo, useState } from "react";

import { BookingCalendar } from "@/components/calendar/BookingCalendar";
import { useBookings } from "@/hooks/use-bookings";
import { toCalendarEvents } from "@/lib/calendar-adapters";
import { Events } from "@/types/event";

export function Calendar() {
  const { data: bookings, loading, error } = useBookings();
  const [currentRange, setCurrentRange] = useState({
    start: new Date().toISOString(),
    end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  });

  // Transform Supabase bookings to EventCalendar format
  const events: Events[] = useMemo(() => {
    if (!bookings || bookings.length === 0) return [];
    return toCalendarEvents(bookings) as Events[];
  }, [bookings]);

  const handleRangeChange = (range: { start: string; end: string }) => {
    setCurrentRange(range);
    // Here you could refetch data for the new range if needed
  };

  return (
    <BookingCalendar
      mode="view"
      events={events}
      initialRange={currentRange}
      onRangeChange={handleRangeChange}
      loading={loading}
      error={error}
    />
  );
}
