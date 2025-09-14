import type { RecurringEvent } from "./event-types";
import type { LocationObject } from "./location";

export interface EventTypeFormData {
  title: string;
  slug: string;
  description?: string;
  length: number; // duration in minutes (using "length" not "length_in_minutes")

  // Location and booking settings
  locations: LocationObject[];
  requiresConfirmation: boolean;
  disableGuests: boolean;
  hideCalendarNotes: boolean;

  // Timing and limits
  minimumBookingNotice: number; // minutes
  beforeEventBuffer: number; // minutes
  afterEventBuffer: number; // minutes

  // Pricing
  currency: string;
  price_cents?: number;
  price?: string | number; // computed field for display, converted from price_cents

  // Advanced fields
  bookingFields: unknown[]; // array of custom booking fields
  bookingLimits: Record<string, unknown>; // booking limits per period
  durationLimits: Record<string, unknown>; // min/max duration limits
  recurringEvent?: RecurringEvent;
  metadata: Record<string, unknown>; // additional metadata

  // Additional form fields referenced in components
  slugManuallySet?: boolean;
  eventName?: string;
  timeZone?: string;
  schedulingType?: string;
  slotInterval?: number;
  periodType?: string;
  periodDays?: number;
  periodStartDate?: string | Date;
  periodEndDate?: string | Date;
  periodCountCalendarDays?: boolean;
  allow_cancellation?: boolean;
  userId?: string;
  scheduleId?: string;
  successRedirectUrl?: string;
  deposit_cents?: number;
  require_agreement?: boolean;
  agreement_text?: string;

  // Slots and scheduling - legacy snake_case fields for API compatibility
  slot_interval?: number;
  hidden?: boolean;
  onlyShowFirstAvailableSlot?: boolean;
  seatsPerTimeSlot?: number;
  seatsShowAttendees?: boolean;
  seatsShowAvailabilityCount?: boolean;
  is_active?: boolean;
  is_paid?: boolean;
}
