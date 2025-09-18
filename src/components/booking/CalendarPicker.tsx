"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Clock, Globe } from "lucide-react";
// Define TimeSlot interface locally to avoid server-side imports
interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
  booked?: boolean;
}

interface CalendarPickerProps {
  eventType: any;
  bookingData: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

const timezones = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Paris", label: "Paris (CET)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Australia/Sydney", label: "Sydney (AEST)" },
];

// Format time slot for display
function formatTimeSlot(
  slot: TimeSlot,
  timezone: string = "America/New_York"
): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: timezone,
  });

  return formatter.format(slot.start);
}

export function CalendarPicker({
  eventType,
  bookingData,
  onUpdate,
  onNext,
}: CalendarPickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    bookingData.selectedDate ? new Date(bookingData.selectedDate) : null
  );
  const [selectedTime, setSelectedTime] = useState<string | null>(
    bookingData.selectedTime || null
  );
  const [timezone, setTimezone] = useState(
    bookingData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Get calendar days for current month
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  // Load available slots for selected date
  useEffect(() => {
    if (selectedDate && eventType) {
      setIsLoadingSlots(true);

      const dateStr = selectedDate.toISOString().split("T")[0];
      const params = new URLSearchParams({
        slug: eventType.slug,
        date: dateStr,
        timezone: timezone,
      });

      fetch(`/api/public/availability?${params}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            throw new Error(data.error);
          }

          // Convert API response to TimeSlot format
          const slots: TimeSlot[] = data.slots.map((slot: any) => ({
            start: new Date(slot.start),
            end: new Date(slot.end),
            available: slot.available,
            booked: false,
          }));

          setAvailableSlots(slots);
        })
        .catch((error) => {
          console.error("Error fetching availability:", error);
          setAvailableSlots([]);
        })
        .finally(() => setIsLoadingSlots(false));
    }
  }, [selectedDate, eventType, timezone]);

  const handleDateSelect = (date: Date) => {
    // Don't allow selecting past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return;

    setSelectedDate(date);
    setSelectedTime(null);
    onUpdate({
      selectedDate: date,
      selectedTime: null,
      timezone,
    });
  };

  const handleTimeSelect = (slot: TimeSlot) => {
    if (!slot.available) return;

    const timeStr = slot.start.toISOString();
    setSelectedTime(timeStr);
    onUpdate({
      selectedDate,
      selectedTime: timeStr,
      timezone,
    });
  };

  const handleContinue = () => {
    if (selectedDate && selectedTime) {
      onNext();
    }
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(
      currentMonth.getMonth() + (direction === "next" ? 1 : -1)
    );
    setCurrentMonth(newMonth);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const calendarDays = getCalendarDays();
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Select Date & Time
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Choose your preferred date and time for your {eventType.title}{" "}
          session.
        </p>
      </div>

      {/* Timezone Selector */}
      <div className="flex items-center gap-2">
        <Globe className="w-4 h-4 text-gray-500" />
        <Select value={timezone} onValueChange={(value) => setTimezone(value)}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {timezones.map((tz) => (
              <SelectItem key={tz.value} value={tz.value}>
                {tz.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calendar */}
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {currentMonth.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </h3>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth("prev")}
                  className="p-1 h-8 w-8"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth("next")}
                  className="p-1 h-8 w-8"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Week Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date, index) => (
                <button
                  key={index}
                  onClick={() => handleDateSelect(date)}
                  disabled={isPastDate(date)}
                  className={`p-2 text-sm font-medium rounded-md transition-colors ${
                    isPastDate(date)
                      ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                      : !isCurrentMonth(date)
                      ? "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                      : selectedDate &&
                        date.toDateString() === selectedDate.toDateString()
                      ? "bg-blue-600 text-white"
                      : isToday(date)
                      ? "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-400"
                      : "text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {date.getDate()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Time Slots */}
        <div>
          {selectedDate ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {formatDate(selectedDate)}
              </h3>

              {isLoadingSlots ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {availableSlots
                    .filter((slot) => slot.available)
                    .map((slot, index) => (
                      <button
                        key={index}
                        onClick={() => handleTimeSelect(slot)}
                        className={`w-full p-3 text-left text-sm font-medium rounded-md border transition-colors ${
                          selectedTime === slot.start.toISOString()
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-600 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{formatTimeSlot(slot, timezone)}</span>
                          <Clock className="w-4 h-4 opacity-50" />
                        </div>
                      </button>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No available times for this date</p>
                  <p className="text-sm">Please select another date</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-8">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Select a date to view available times</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button
          onClick={handleContinue}
          disabled={!selectedDate || !selectedTime}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
