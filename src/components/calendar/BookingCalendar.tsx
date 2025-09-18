"use client";

import React, { useMemo, useState } from "react";

import { EventCalendar } from "@/components/event-calendar/event-calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Events } from "@/types/event";

interface DateRange {
  start: string;
  end: string;
}

interface BookingCalendarProps {
  mode: "view" | "availability";
  initialRange?: DateRange;
  events?: Events[];
  onCreateBooking?: (payload: any) => Promise<void>;
  onRangeChange?: (range: DateRange) => void;
  loading?: boolean;
  error?: string | null;
}

const colorPalette = [
  "indigo",
  "blue",
  "emerald",
  "amber",
  "rose",
  "purple",
  "teal",
  "orange",
];

export function BookingCalendar({
  mode,
  initialRange,
  events = [],
  onCreateBooking,
  onRangeChange,
  loading = false,
  error,
}: BookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedColorFilter, setSelectedColorFilter] = useState<string | null>(
    null
  );

  // Color mapping for events
  const eventsWithColors = useMemo(() => {
    return events.map((event, index) => ({
      ...event,
      color: event.color || colorPalette[index % colorPalette.length],
    }));
  }, [events]);

  // Filter events by color if selected
  const filteredEvents = useMemo(() => {
    if (!selectedColorFilter) return eventsWithColors;
    return eventsWithColors.filter(
      (event) => event.color === selectedColorFilter
    );
  }, [eventsWithColors, selectedColorFilter]);

  // Get unique colors from events
  const availableColors = useMemo(() => {
    const colors = new Set(eventsWithColors.map((event) => event.color));
    return Array.from(colors);
  }, [eventsWithColors]);

  const handleDateChange = (date: Date) => {
    setCurrentDate(date);

    // Calculate range for the current view (month)
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    if (onRangeChange) {
      onRangeChange({
        start: start.toISOString(),
        end: end.toISOString(),
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading calendar...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-muted-foreground">Error loading calendar</p>
            <p className="text-sm text-muted-foreground mt-2">{error}</p>
            <Button
              onClick={() =>
                typeof window !== "undefined" && window.location.reload()
              }
              className="mt-4"
              variant="outline"
            >
              Reload Page
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with filters - always visible */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                {mode === "availability"
                  ? "Availability Calendar"
                  : "Booking Calendar"}
              </CardTitle>
              <CardDescription>
                {mode === "availability"
                  ? "Manage your availability and create new bookings"
                  : "View all your bookings in calendar format"}
              </CardDescription>
            </div>

            {mode === "availability" && onCreateBooking && (
              <Button
                onClick={() => {
                  // This will be handled by the EventCreateDialog from the EventCalendar
                  // For now, just a placeholder
                }}
              >
                Add Event
              </Button>
            )}
          </div>

          {/* Color filters - always visible */}
          {availableColors.length > 0 && (
            <div className="flex items-center gap-2 mt-4">
              <span className="text-sm text-muted-foreground">
                Filter by type:
              </span>
              <Button
                variant={selectedColorFilter === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedColorFilter(null)}
              >
                All ({events.length})
              </Button>
              {availableColors.map((color) => {
                const count = eventsWithColors.filter(
                  (e) => e.color === color
                ).length;
                return (
                  <Button
                    key={color}
                    variant={
                      selectedColorFilter === color ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedColorFilter(color)}
                    className="gap-2"
                  >
                    <div className={`w-3 h-3 rounded-full bg-${color}-500`} />
                    {color} ({count})
                  </Button>
                );
              })}
            </div>
          )}

          {/* Show message when no filters match */}
          {selectedColorFilter && filteredEvents.length === 0 && (
            <div className="text-sm text-muted-foreground mt-2">
              No {selectedColorFilter} events found
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Calendar component - always render */}
      <div className="w-full relative">
        <EventCalendar
          events={filteredEvents}
          initialDate={currentDate}
          onDateChange={handleDateChange}
        />
        {filteredEvents.length === 0 && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80">
            <div className="text-center">
              <p className="text-muted-foreground">
                {selectedColorFilter
                  ? `No ${selectedColorFilter} events found`
                  : mode === "availability"
                  ? "No events scheduled"
                  : "No bookings found"}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {mode === "availability"
                  ? "Create your first event using the Add Event button"
                  : "Your calendar is currently empty"}
              </p>
              {mode === "availability" && onCreateBooking && (
                <Button
                  className="mt-4"
                  onClick={() => {
                    // Trigger event creation
                  }}
                >
                  Add Event
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
