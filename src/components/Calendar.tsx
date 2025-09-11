"use client";

import React, { useMemo, useState } from "react";
import { useBookings } from "@/hooks/use-bookings";
import { EventCalendar } from "@/components/event-calendar/event-calendar";
import { Events } from "@/types/event";
import { parseISO, format } from "date-fns";

export function Calendar() {
  const { data: bookings, loading, error } = useBookings();

  // Transform Supabase bookings to EventCalendar format
  const events: Events[] = useMemo(() => {
    if (!bookings || bookings.length === 0) return [];

    return bookings.map((booking) => {
      try {
        // Handle potentially missing date fields
        const startDate = booking.start_time
          ? parseISO(booking.start_time)
          : new Date();
        const endDate = booking.end_time
          ? parseISO(booking.end_time)
          : new Date(startDate.getTime() + 60 * 60 * 1000);

        // Handle potentially corrupted dates
        const validStartDate = !isNaN(startDate.getTime())
          ? startDate
          : new Date();
        const validEndDate = !isNaN(endDate.getTime())
          ? endDate
          : new Date(validStartDate.getTime() + 60 * 60 * 1000);

        // Generate color based on session type
        const getColorBySessionType = (sessionType: string) => {
          const colors: Record<string, string> = {
            'Portrait Session': '#3b82f6', // blue
            'Wedding': '#ef4444', // red
            'Consultation': '#10b981', // emerald
            'Corporate': '#8b5cf6', // violet
            'Event': '#f59e0b', // amber
            'Family': '#ec4899', // pink
          };
          return colors[sessionType] || '#6b7280'; // default gray
        };

        return {
          id: booking.id || String(Date.now()),
          title: booking.session_type || "Booking",
          description: booking.client?.name
            ? `${booking.session_type} with ${booking.client.name}`
            : booking.session_type || "Session",
          startDate: validStartDate,
          endDate: validEndDate,
          startTime: format(validStartDate, "HH:mm"),
          endTime: format(validEndDate, "HH:mm"),
          isRepeating: false, // Simplified - no recurring info in new schema
          repeatingType: null,
          location: "TBD", // No location info in simplified schema
          category: booking.category || booking.session_type || "Photography",
          color: getColorBySessionType(booking.session_type),
          createdAt: booking.created_at
            ? parseISO(booking.created_at)
            : new Date(),
          updatedAt: booking.created_at
            ? parseISO(booking.created_at)
            : new Date(),
          // Additional booking data for the event
          clientId: booking.client_id,
          clientName: booking.client?.name,
          clientEmail: booking.client?.email,
        } as Events;
      } catch (error) {
        console.error("Error processing booking:", booking, error);
        // Return a fallback event when data is corrupt
        return {
          id: String(Date.now() + Math.random()),
          title: "Booking",
          description: "Details unavailable",
          startDate: new Date(),
          endDate: new Date(Date.now() + 60 * 60 * 1000),
          startTime: "00:00",
          endTime: "01:00",
          isRepeating: false,
          repeatingType: null,
          location: "TBD",
          category: "Unknown",
          color: "#6b7280",
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Events;
      }
    });
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
            onClick={() => typeof window !== "undefined" && window.location.reload()}
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
