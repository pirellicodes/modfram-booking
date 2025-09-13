// Database table types
export type Booking = {
  id: string;
  client_id: string;
  session_type: string;
  category: string;
  start_time: string;
  end_time: string;
  created_at: string;
  status?: string;
  notes?: string;
  user_id: string;
};

export type Client = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
  created_at: string;
};

export type Payment = {
  id: string;
  booking_id: string;
  amount_cents: number;
  currency: string;
  provider?: string;
  status: "pending" | "succeeded" | "failed";
  stripe_payment_intent_id?: string;
  created_at: string;
  user_id: string;
};

export type Availability = {
  id: string;
  user_id: string;
  day_of_week: number; // 0-6 (Sunday-Saturday)
  start_time: string; // HH:mm format
  end_time: string; // HH:mm format
  slots?: Array<{
    start: string;
    end: string;
  }>;
};

// Joined types for components
export type BookingWithClient = Booking & {
  client?: Client;
  clients?: Client; // For Supabase join compatibility
};

export type PaymentWithBooking = Payment & {
  bookings: BookingWithClient;
};

// Event type related types
export type LocationObject = {
  type:
    | "zoom"
    | "googlemeet"
    | "teams"
    | "phone"
    | "inPerson"
    | "link"
    | "custom";
  address?: string;
  link?: string;
  phone?: string;
  displayLocationPublicly?: boolean;
};

export type BookingField = {
  name: string;
  type:
    | "text"
    | "email"
    | "phone"
    | "textarea"
    | "select"
    | "multiselect"
    | "number"
    | "checkbox";
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
};

export type BookingLimits = {
  day?: number;
  week?: number;
  month?: number;
  year?: number;
};

export type DurationLimits = {
  min?: number; // minutes
  max?: number; // minutes
};

export type RecurringEvent = {
  freq?: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  interval?: number;
  count?: number;
  until?: string;
  byWeekDay?: number[];
  byMonthDay?: number[];
  bySetPos?: number;
};

// Event Type from database with parsed JSON fields
export type EventTypeWithParsedFields = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  length: number;
  hidden: boolean;
  position: number;
  eventName?: string;
  timeZone?: string;
  schedulingType?: string;
  periodType?: string;
  periodStartDate?: string;
  periodEndDate?: string;
  periodDays?: number;
  periodCountCalendarDays?: boolean;
  requiresConfirmation?: boolean;
  disableGuests?: boolean;
  hideCalendarNotes?: boolean;
  minimumBookingNotice?: number;
  beforeEventBuffer?: number;
  afterEventBuffer?: number;
  price?: string;
  currency?: string;
  slotInterval?: number;
  successRedirectUrl?: string;
  onlyShowFirstAvailableSlot?: boolean;
  seatsPerTimeSlot?: number;
  seatsShowAttendees?: boolean;
  seatsShowAvailabilityCount?: boolean;
  userId?: string;
  teamId?: string;
  parentId?: string;
  scheduleId?: string;
  assignAllTeamMembers?: boolean;
  locations?: LocationObject[];
  metadata?: Record<string, unknown>;
  bookingFields?: BookingField[];
  bookingLimits?: BookingLimits;
  durationLimits?: DurationLimits;
  recurringEvent?: RecurringEvent;
  createdAt: string;
  updatedAt: string;
  // Additional fields for paid events
  is_paid?: boolean;
  deposit_cents?: number;
  require_agreement?: boolean;
  agreement_text?: string;
  allow_cancellation?: boolean;
};
