import { createServerClient } from "@/lib/supabase-server";

export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
  booked?: boolean;
}

export interface DaySchedule {
  enabled: boolean;
  slots: { start: string; end: string }[];
}

export interface AvailabilityData {
  day_of_week: number; // 0 = Sunday, 1 = Monday, etc.
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
}

export interface BookingData {
  start_time: string;
  end_time: string;
  date: string;
}

/**
 * Generate available time slots for a given date and event type
 */
export async function generateTimeSlots(
  date: Date,
  eventTypeId: string,
  userId: string,
  duration: number = 30,
  timezone: string = "America/New_York"
): Promise<TimeSlot[]> {
  const supabase = await createServerClient();

  // Get day of week (0 = Sunday, 1 = Monday, etc.)
  const dayOfWeek = date.getDay();

  // Get availability for this day of week
  const { data: availability } = await supabase
    .from("availability")
    .select("*")
    .eq("user_id", userId)
    .eq("day_of_week", dayOfWeek);

  if (!availability || availability.length === 0) {
    return [];
  }

  // Get existing bookings for this date
  const dateStr = date.toISOString().split("T")[0];
  const { data: bookings } = await supabase
    .from("bookings")
    .select("start_time, end_time, date")
    .eq("date", dateStr)
    .eq("status", "confirmed");

  const slots: TimeSlot[] = [];

  // Generate slots for each availability period
  for (const avail of availability) {
    const daySlots = generateSlotsForPeriod(
      date,
      avail.start_time,
      avail.end_time,
      duration,
      bookings || []
    );
    slots.push(...daySlots);
  }

  // Sort slots by start time
  slots.sort((a, b) => a.start.getTime() - b.start.getTime());

  // Filter out past slots for today
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return slots.filter((slot) => slot.start > now);
  }

  return slots;
}

/**
 * Generate time slots for a specific time period
 */
function generateSlotsForPeriod(
  date: Date,
  startTime: string,
  endTime: string,
  duration: number,
  bookings: BookingData[]
): TimeSlot[] {
  const slots: TimeSlot[] = [];

  // Parse start and end times
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  // Create start and end datetime objects
  const periodStart = new Date(date);
  periodStart.setHours(startHour, startMinute, 0, 0);

  const periodEnd = new Date(date);
  periodEnd.setHours(endHour, endMinute, 0, 0);

  // Generate slots
  let current = new Date(periodStart);

  while (current < periodEnd) {
    const slotEnd = new Date(current.getTime() + duration * 60000);

    // Check if this slot would extend beyond the availability period
    if (slotEnd > periodEnd) {
      break;
    }

    // Check if this slot conflicts with existing bookings
    const isBooked = bookings.some((booking) => {
      const bookingStart = new Date(`${booking.date}T${booking.start_time}`);
      const bookingEnd = new Date(`${booking.date}T${booking.end_time}`);

      // Check for overlap
      return current < bookingEnd && slotEnd > bookingStart;
    });

    slots.push({
      start: new Date(current),
      end: new Date(slotEnd),
      available: !isBooked,
      booked: isBooked,
    });

    // Move to next slot (15-minute intervals for better granularity)
    current = new Date(current.getTime() + 15 * 60000);
  }

  return slots;
}

/**
 * Check if a specific time slot is available
 */
export async function isSlotAvailable(
  startTime: Date,
  endTime: Date,
  eventTypeId: string,
  userId: string
): Promise<boolean> {
  const supabase = await createServerClient();

  // Check availability for this day of week and time
  const dayOfWeek = startTime.getDay();
  const startTimeStr = `${startTime
    .getHours()
    .toString()
    .padStart(2, "0")}:${startTime.getMinutes().toString().padStart(2, "0")}`;
  const endTimeStr = `${endTime
    .getHours()
    .toString()
    .padStart(2, "0")}:${endTime.getMinutes().toString().padStart(2, "0")}`;

  const { data: availability } = await supabase
    .from("availability")
    .select("*")
    .eq("user_id", userId)
    .eq("day_of_week", dayOfWeek)
    .lte("start_time", startTimeStr)
    .gte("end_time", endTimeStr);

  if (!availability || availability.length === 0) {
    return false;
  }

  // Check for conflicting bookings
  const dateStr = startTime.toISOString().split("T")[0];
  const { data: bookings } = await supabase
    .from("bookings")
    .select("start_time, end_time")
    .eq("date", dateStr)
    .eq("status", "confirmed")
    .or(`and(start_time.lt.${endTimeStr},end_time.gt.${startTimeStr})`);

  return !bookings || bookings.length === 0;
}

/**
 * Get user availability data
 */
export async function getUserAvailability(
  userId: string
): Promise<AvailabilityData[]> {
  const supabase = await createServerClient();

  const { data: availability, error } = await supabase
    .from("availability")
    .select("*")
    .eq("user_id", userId)
    .order("day_of_week", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    throw error;
  }

  return availability || [];
}

/**
 * Format time slot for display
 */
export function formatTimeSlot(
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

/**
 * Get next available slots (for quick booking suggestions)
 */
export async function getNextAvailableSlots(
  eventTypeId: string,
  userId: string,
  duration: number = 30,
  limit: number = 10
): Promise<TimeSlot[]> {
  const slots: TimeSlot[] = [];
  let currentDate = new Date();

  // Look ahead up to 30 days
  for (let i = 0; i < 30 && slots.length < limit; i++) {
    const daySlots = await generateTimeSlots(
      currentDate,
      eventTypeId,
      userId,
      duration
    );
    const availableSlots = daySlots.filter((slot) => slot.available);

    slots.push(...availableSlots);

    // Move to next day
    currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
  }

  return slots.slice(0, limit);
}
