// Standardized date handling utilities for consistent date/time operations

import {
  addDays,
  endOfDay,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isValid,
  parse,
  parseISO,
  startOfDay,
  subDays,
} from "date-fns";

import type { DateInput, ISOString, TimeString } from "@/types";

/**
 * Convert various date inputs to a Date object
 */
export function toDate(input: DateInput): Date {
  if (input instanceof Date) {
    return input;
  }

  if (typeof input === "string") {
    // Try parsing as ISO string first
    const isoDate = parseISO(input);
    if (isValid(isoDate)) {
      return isoDate;
    }

    // Fallback to Date constructor
    const fallbackDate = new Date(input);
    if (isValid(fallbackDate)) {
      return fallbackDate;
    }
  }

  if (typeof input === "number") {
    const numericDate = new Date(input);
    if (isValid(numericDate)) {
      return numericDate;
    }
  }

  throw new Error(`Invalid date input: ${input}`);
}

/**
 * Convert Date to ISO string for API communication
 */
export function toISOString(date: DateInput): ISOString {
  return toDate(date).toISOString();
}

/**
 * Convert Date to local date string (YYYY-MM-DD)
 */
export function toLocalDateString(date: DateInput): string {
  return format(toDate(date), "yyyy-MM-dd");
}

/**
 * Convert Date to time string (HH:mm)
 */
export function toTimeString(date: DateInput): TimeString {
  return format(toDate(date), "HH:mm");
}

/**
 * Parse time string (HH:mm) and combine with a date
 */
export function parseTimeString(
  timeStr: TimeString,
  baseDate: DateInput = new Date()
): Date {
  const base = toDate(baseDate);
  const parsed = parse(timeStr, "HH:mm", base);

  if (!isValid(parsed)) {
    throw new Error(`Invalid time string: ${timeStr}`);
  }

  return parsed;
}

/**
 * Format date for display in various formats
 */
export function formatDate(date: DateInput, formatStr: string = "PPP"): string {
  return format(toDate(date), formatStr);
}

/**
 * Format date and time for display
 */
export function formatDateTime(
  date: DateInput,
  formatStr: string = "PPP p"
): string {
  return format(toDate(date), formatStr);
}

/**
 * Format time for display
 */
export function formatTime(date: DateInput, format24h: boolean = true): string {
  const formatStr = format24h ? "HH:mm" : "h:mm a";
  return format(toDate(date), formatStr);
}

/**
 * Get start of day for a given date
 */
export function getStartOfDay(date: DateInput): Date {
  return startOfDay(toDate(date));
}

/**
 * Get end of day for a given date
 */
export function getEndOfDay(date: DateInput): Date {
  return endOfDay(toDate(date));
}

/**
 * Add days to a date
 */
export function addDaysToDate(date: DateInput, days: number): Date {
  return addDays(toDate(date), days);
}

/**
 * Subtract days from a date
 */
export function subtractDaysFromDate(date: DateInput, days: number): Date {
  return subDays(toDate(date), days);
}

/**
 * Check if two dates are the same day
 */
export function areSameDay(date1: DateInput, date2: DateInput): boolean {
  return isSameDay(toDate(date1), toDate(date2));
}

/**
 * Check if first date is before second date
 */
export function isDateBefore(date1: DateInput, date2: DateInput): boolean {
  return isBefore(toDate(date1), toDate(date2));
}

/**
 * Check if first date is after second date
 */
export function isDateAfter(date1: DateInput, date2: DateInput): boolean {
  return isAfter(toDate(date1), toDate(date2));
}

/**
 * Validate if a date input is valid
 */
export function isValidDate(date: DateInput): boolean {
  try {
    return isValid(toDate(date));
  } catch {
    return false;
  }
}

/**
 * Get current date as ISO string
 */
export function getCurrentISOString(): ISOString {
  return new Date().toISOString();
}

/**
 * Get current date
 */
export function getCurrentDate(): Date {
  return new Date();
}

/**
 * Convert form data dates (Date objects) to API format (ISO strings)
 */
export function formDataToApiDates<T extends Record<string, unknown>>(
  data: T,
  dateFields: (keyof T)[]
): T {
  const result = { ...data };

  for (const field of dateFields) {
    if (result[field] instanceof Date) {
      result[field] = toISOString(result[field]) as T[keyof T];
    }
  }

  return result;
}

/**
 * Convert API data dates (ISO strings) to form format (Date objects)
 */
export function apiDataToFormDates<T extends Record<string, unknown>>(
  data: T,
  dateFields: (keyof T)[]
): T {
  const result = { ...data };

  for (const field of dateFields) {
    if (typeof result[field] === "string") {
      result[field] = toDate(result[field]) as T[keyof T];
    }
  }

  return result;
}

/**
 * Create a date range for queries
 */
export function createDateRange(
  start: DateInput,
  end?: DateInput
): { start: ISOString; end: ISOString } {
  const startDate = getStartOfDay(start);
  const endDate = end ? getEndOfDay(end) : getEndOfDay(start);

  return {
    start: toISOString(startDate),
    end: toISOString(endDate),
  };
}

/**
 * Get available time slots for a given day based on availability
 */
export function getAvailableTimeSlots(
  date: DateInput,
  slots: Array<{ start: TimeString; end: TimeString }>,
  durationMinutes: number = 60,
  bufferMinutes: number = 0
): Array<{ start: Date; end: Date }> {
  const baseDate = toDate(date);
  const availableSlots: Array<{ start: Date; end: Date }> = [];

  for (const slot of slots) {
    const slotStart = parseTimeString(slot.start, baseDate);
    const slotEnd = parseTimeString(slot.end, baseDate);

    let currentTime = slotStart;
    while (
      currentTime.getTime() + durationMinutes * 60000 <=
      slotEnd.getTime()
    ) {
      const slotEndTime = new Date(
        currentTime.getTime() + durationMinutes * 60000
      );

      availableSlots.push({
        start: new Date(currentTime),
        end: slotEndTime,
      });

      // Move to next slot considering buffer time
      currentTime = new Date(slotEndTime.getTime() + bufferMinutes * 60000);
    }
  }

  return availableSlots;
}

/**
 * Check if a time slot is available (not overlapping with existing bookings)
 */
export function isTimeSlotAvailable(
  slotStart: DateInput,
  slotEnd: DateInput,
  existingBookings: Array<{ start: DateInput; end: DateInput }>,
  bufferMinutes: number = 0
): boolean {
  const start = toDate(slotStart);
  const end = toDate(slotEnd);

  for (const booking of existingBookings) {
    const bookingStart = new Date(
      toDate(booking.start).getTime() - bufferMinutes * 60000
    );
    const bookingEnd = new Date(
      toDate(booking.end).getTime() + bufferMinutes * 60000
    );

    // Check for overlap
    if (start < bookingEnd && end > bookingStart) {
      return false;
    }
  }

  return true;
}

/**
 * Get weekday number (0 = Sunday, 6 = Saturday)
 */
export function getWeekday(date: DateInput): number {
  return toDate(date).getDay();
}

/**
 * Get weekday names
 */
export function getWeekdayNames(short: boolean = false): string[] {
  const names = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return short ? names.map((name) => name.substring(0, 3)) : names;
}

/**
 * Get month names
 */
export function getMonthNames(short: boolean = false): string[] {
  const names = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return short ? names.map((name) => name.substring(0, 3)) : names;
}

/**
 * Timezone utilities
 */
export function getTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function formatInTimezone(
  date: DateInput,
  timezone: string,
  formatStr: string = "PPP p"
): string {
  return format(toDate(date), formatStr);
}

/**
 * Business day utilities
 */
export function isWeekday(date: DateInput): boolean {
  const day = getWeekday(date);
  return day >= 1 && day <= 5; // Monday to Friday
}

export function isWeekend(date: DateInput): boolean {
  return !isWeekday(date);
}

export function getNextWeekday(date: DateInput): Date {
  let nextDay = addDaysToDate(date, 1);
  while (!isWeekday(nextDay)) {
    nextDay = addDaysToDate(nextDay, 1);
  }
  return nextDay;
}

export function getPreviousWeekday(date: DateInput): Date {
  let prevDay = subtractDaysFromDate(date, 1);
  while (!isWeekday(prevDay)) {
    prevDay = subtractDaysFromDate(prevDay, 1);
  }
  return prevDay;
}
