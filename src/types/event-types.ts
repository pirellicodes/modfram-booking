import { type EventType } from '@/db/schema';

export interface LocationObject {
  type: string;
  address?: string;
  link?: string;
  phone?: string;
}

export interface BookingField {
  name: string;
  type: string;
  label: string;
  required: boolean;
  placeholder?: string;
}

export interface BookingLimits {
  day?: number;
  week?: number;
  month?: number;
  year?: number;
}

export interface DurationLimits {
  min?: number;
  max?: number;
}

export interface RecurringEvent {
  freq?: string;
  interval?: number;
  count?: number;
  until?: string;
}

export interface EventTypeWithParsedFields extends Omit<EventType, 'locations' | 'metadata' | 'bookingFields' | 'bookingLimits' | 'durationLimits' | 'recurringEvent'> {
  locations?: LocationObject[];
  metadata?: Record<string, unknown>;
  bookingFields?: BookingField[];
  bookingLimits?: BookingLimits;
  durationLimits?: DurationLimits;
  recurringEvent?: RecurringEvent;
}

export interface FormData extends Partial<EventTypeWithParsedFields> {
  slugManuallySet?: boolean;
}
