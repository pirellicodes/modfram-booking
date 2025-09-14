import type { LocationObject } from "./location";

export interface RecurringEvent {
  freq?: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  interval?: number;
  count?: number;
  until?: string; // ISO
  byweekday?: string[]; // e.g. ["MO","TU"]
  bymonthday?: number[]; // e.g. [1,15,31]
}

export interface EventTypeWithParsedFields
  extends Omit<
    import("@/db/schema").EventType,
    | "locations"
    | "metadata"
    | "bookingFields"
    | "bookingLimits"
    | "durationLimits"
    | "recurringEvent"
  > {
  locations?: LocationObject[];
  metadata?: Record<string, unknown>;
  bookingFields?: unknown[];
  bookingLimits?: Record<string, unknown>;
  durationLimits?: Record<string, unknown>;
  recurringEvent?: RecurringEvent;

  // Alias fields for component compatibility
  price_cents?: number;
  duration_minutes?: number; // alias for length field
}

export type { LocationObject };
