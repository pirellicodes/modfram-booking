"use client";

import { useState } from "react";
import { useBookings } from "@/hooks/use-dashboard-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar as CalendarPrimitive } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  ClockIcon,
  UserIcon,
} from "lucide-react";
import {
  format,
  parseISO,
  isSameDay,
  startOfMonth,
  endOfMonth,
} from "date-fns";

interface BookingEvent {
  id: string;
  title: string;
  client: {
    name: string;
    email: string;
  };
  startTime: Date;
  endTime: Date;
  category?: string | null;
  status: "upcoming" | "completed" | "cancelled";
}

export function Calendar() {
  const { data: bookings, loading, error } = useBookings();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedBooking, setSelectedBooking] = useState<BookingEvent | null>(
    null
  );
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // Transform bookings data to calendar events
  const events: BookingEvent[] = bookings.map((booking) => ({
    id: booking.id,
    title: booking.session_type,
    client: {
      name: booking.clients.name,
      email: booking.clients.email,
    },
    startTime: parseISO(booking.start_time),
    endTime: parseISO(booking.end_time),
    category: booking.category,
    status: getBookingStatus(booking),
  }));

  function getBookingStatus(booking: {
    end_time: string;
  }): "upcoming" | "completed" | "cancelled" {
    const now = new Date();
    const endTime = new Date(booking.end_time);

    if (endTime < now) return "completed";
    return "upcoming";
  }

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter((event) => isSameDay(event.startTime, date));
  };

  // Get events for the current month
  const getEventsForMonth = (month: Date) => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);

    return events.filter(
      (event) => event.startTime >= start && event.startTime <= end
    );
  };

  const selectedDateEvents = getEventsForDate(selectedDate);
  const monthEvents = getEventsForMonth(currentMonth);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleEventClick = (event: BookingEvent) => {
    setSelectedBooking(event);
    setIsEventDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-500/10 text-blue-700 hover:bg-blue-500/20";
      case "completed":
        return "bg-green-500/10 text-green-700 hover:bg-green-500/20";
      case "cancelled":
        return "bg-red-500/10 text-red-700 hover:bg-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-700 hover:bg-gray-500/20";
    }
  };

  const formatTime = (date: Date) => {
    return format(date, "h:mm a");
  };

  const formatDuration = (start: Date, end: Date) => {
    const durationMs = end.getTime() - start.getTime();
    const durationMinutes = Math.floor(durationMs / (1000 * 60));

    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    if (hours > 0) {
      return `${hours}h${minutes > 0 ? ` ${minutes}m` : ""}`;
    }
    return `${minutes}m`;
  };

  // Days that have events
  const daysWithEvents = monthEvents.reduce((acc, event) => {
    const dateKey = format(event.startTime, "yyyy-MM-dd");
    if (!acc[dateKey]) {
      acc[dateKey] = 0;
    }
    acc[dateKey]++;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Calendar</h2>
            <p className="text-muted-foreground">
              View and manage your bookings calendar
            </p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardContent className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Calendar</h2>
            <p className="text-muted-foreground">
              View and manage your bookings calendar
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-96 text-muted-foreground">
            {error}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <CalendarIcon className="h-6 w-6" />
            Calendar
          </h2>
          <p className="text-muted-foreground">
            View and manage your bookings calendar
          </p>
        </div>
        <Button>
          <PlusIcon className="h-4 w-4 mr-2" />
          New Booking
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Calendar */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{format(currentMonth, "MMMM yyyy")}</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentMonth(
                      new Date(
                        currentMonth.getFullYear(),
                        currentMonth.getMonth() - 1
                      )
                    )
                  }
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(new Date())}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentMonth(
                      new Date(
                        currentMonth.getFullYear(),
                        currentMonth.getMonth() + 1
                      )
                    )
                  }
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              {monthEvents.length} booking{monthEvents.length !== 1 ? "s" : ""}{" "}
              this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CalendarPrimitive
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="rounded-md border"
              modifiers={{
                hasEvents: (date) => {
                  const dateKey = format(date, "yyyy-MM-dd");
                  return !!daysWithEvents[dateKey];
                },
              }}
              modifiersStyles={{
                hasEvents: {
                  backgroundColor: "hsl(var(--primary) / 0.1)",
                  color: "hsl(var(--primary))",
                  fontWeight: "bold",
                },
              }}
            />
          </CardContent>
        </Card>

        {/* Selected Date Events */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {format(selectedDate, "EEEE, MMMM d")}
            </CardTitle>
            <CardDescription>
              {selectedDateEvents.length} booking
              {selectedDateEvents.length !== 1 ? "s" : ""} scheduled
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDateEvents.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">
                  No bookings
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  No appointments scheduled for this date.
                </p>
                <div className="mt-6">
                  <Button size="sm">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Schedule Booking
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateEvents
                  .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
                  .map((event) => (
                    <div
                      key={event.id}
                      className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {event.client.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium truncate">
                              {event.title}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {event.client.name}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <ClockIcon className="h-3 w-3" />
                              {formatTime(event.startTime)} -{" "}
                              {formatTime(event.endTime)}
                            </div>
                          </div>
                        </div>
                        <Badge
                          variant="secondary"
                          className={getStatusColor(event.status)}
                        >
                          {event.status}
                        </Badge>
                      </div>
                      {event.category && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          {event.category}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Bookings</CardTitle>
          <CardDescription>Next 7 days overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {events
              .filter((event) => event.status === "upcoming")
              .slice(0, 8)
              .map((event) => (
                <div
                  key={event.id}
                  className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleEventClick(event)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {event.client.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-sm font-medium truncate">
                      {event.title}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(event.startTime, "MMM d")} at{" "}
                    {formatTime(event.startTime)}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Event Details Dialog */}
      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              Complete information about this booking session.
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {selectedBooking.client.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">
                    {selectedBooking.client.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {selectedBooking.client.email}
                  </div>
                </div>
              </div>

              <div className="space-y-3 border-t pt-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Session
                  </label>
                  <div>{selectedBooking.title}</div>
                </div>

                {selectedBooking.category && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Category
                    </label>
                    <div>{selectedBooking.category}</div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Date & Time
                  </label>
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    {format(selectedBooking.startTime, "EEEE, MMMM d, yyyy")}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <ClockIcon className="h-4 w-4 text-muted-foreground" />
                    {formatTime(selectedBooking.startTime)} -{" "}
                    {formatTime(selectedBooking.endTime)}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Duration
                  </label>
                  <div>
                    {formatDuration(
                      selectedBooking.startTime,
                      selectedBooking.endTime
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Status
                  </label>
                  <div className="mt-1">
                    <Badge
                      variant="secondary"
                      className={getStatusColor(selectedBooking.status)}
                    >
                      {selectedBooking.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1">
                  <UserIcon className="h-4 w-4 mr-2" />
                  Contact Client
                </Button>
                {selectedBooking.status === "upcoming" && (
                  <Button variant="outline" className="flex-1">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Reschedule
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
