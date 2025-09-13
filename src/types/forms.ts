// Form data types that align with database schemas and form validation

import { z } from "zod";
import type {
  Client,
  Event,
  Booking,
  Availability,
  TimeSlot,
  EventType,
} from "./index";

// Form data interfaces
export interface ClientFormData {
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
}

export interface EventFormData {
  title: string;
  start: Date;
  end: Date;
  notes?: string;
}

export interface BookingFormData {
  client_id?: string;
  start: Date;
  end: Date;
  status: Booking["status"];
  notes?: string;
}

export interface AvailabilityFormData {
  weekday: number;
  slots: TimeSlot[];
}

// Import location and other types from event-types
export interface LocationObject {
  type: string;
  address?: string;
  link?: string;
  phone?: string;
  text?: string;
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

export interface EventTypeFormData {
  title: string;
  description?: string;
  duration_minutes: number;
  price_cents?: number;
  buffer_time_minutes?: number;
  max_bookings_per_day?: number;
  requires_confirmation?: boolean;
  is_active: boolean;
  booking_window_days?: number;
  minimum_notice_hours?: number;

  // Extended form fields
  slug?: string;
  slugManuallySet?: boolean;
  length?: number; // alias for duration_minutes
  eventName?: string;
  hidden?: boolean;
  locations?: LocationObject[];
  price?: string; // string version of price for form
  currency?: string;
  is_paid?: boolean;
  deposit_cents?: number;
  require_agreement?: boolean;
  agreement_text?: string;
  schedulingType?: string;
  slotInterval?: number;
  timeZone?: string;
  allow_cancellation?: boolean;
  bookingFields?: BookingField[];
  bookingLimits?: BookingLimits;
  durationLimits?: DurationLimits;
  recurringEvent?: RecurringEvent;
  metadata?: Record<string, unknown>;
}

// Zod schemas for form validation
export const timeSlotSchema = z.object({
  start: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"),
  end: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"),
});

export const clientFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name too long"),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  phone: z
    .string()
    .max(50, "Phone number too long")
    .optional()
    .or(z.literal("")),
  notes: z.string().max(1000, "Notes too long").optional().or(z.literal("")),
});

export const eventFormSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(255, "Title too long"),
    start: z.date({
      message: "Start date is required",
    }),
    end: z.date({
      message: "End date is required",
    }),
    notes: z.string().max(1000, "Notes too long").optional().or(z.literal("")),
  })
  .refine((data) => data.end > data.start, {
    message: "End date must be after start date",
    path: ["end"],
  });

export const bookingFormSchema = z
  .object({
    client_id: z
      .string()
      .uuid("Invalid client ID")
      .optional()
      .or(z.literal("")),
    start: z.date({
      message: "Start date is required",
    }),
    end: z.date({
      message: "End date is required",
    }),
    status: z.enum(["pending", "confirmed", "cancelled", "completed"]),
    notes: z.string().max(1000, "Notes too long").optional().or(z.literal("")),
  })
  .refine((data) => data.end > data.start, {
    message: "End date must be after start date",
    path: ["end"],
  });

export const availabilityFormSchema = z.object({
  weekday: z.number().int().min(0).max(6, "Invalid weekday (0-6)"),
  slots: z.array(timeSlotSchema).min(1, "At least one time slot is required"),
});

export const eventTypeFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
  description: z
    .string()
    .max(1000, "Description too long")
    .optional()
    .or(z.literal("")),
  duration_minutes: z
    .number()
    .int()
    .min(5, "Minimum duration is 5 minutes")
    .max(1440, "Maximum duration is 24 hours"),
  price_cents: z.number().int().min(0, "Price cannot be negative").optional(),
  buffer_time_minutes: z
    .number()
    .int()
    .min(0, "Buffer time cannot be negative")
    .max(480, "Maximum buffer time is 8 hours")
    .optional(),
  max_bookings_per_day: z
    .number()
    .int()
    .min(1, "Must allow at least 1 booking per day")
    .optional(),
  requires_confirmation: z.boolean().optional(),
  is_active: z.boolean(),
  booking_window_days: z
    .number()
    .int()
    .min(1, "Booking window must be at least 1 day")
    .optional(),
  minimum_notice_hours: z
    .number()
    .int()
    .min(0, "Minimum notice cannot be negative")
    .optional(),
});

// Form field types for reusable components
export interface FormFieldProps<TValue = unknown> {
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  value?: TValue;
  onChange?: (value: TValue) => void;
  onBlur?: () => void;
}

export interface SelectOption<TValue = string> {
  label: string;
  value: TValue;
  disabled?: boolean;
}

export interface SelectFieldProps<TValue = string>
  extends Omit<FormFieldProps<TValue>, "onChange"> {
  options: SelectOption<TValue>[];
  multiple?: boolean;
  searchable?: boolean;
  onChange?: (value: TValue | TValue[]) => void;
}

export interface DateFieldProps extends Omit<FormFieldProps<Date>, "onChange"> {
  minDate?: Date;
  maxDate?: Date;
  showTime?: boolean;
  format?: string;
  onChange?: (value: Date | null) => void;
}

export interface TimeFieldProps
  extends Omit<FormFieldProps<string>, "onChange"> {
  format24h?: boolean;
  step?: number; // minutes
  onChange?: (value: string) => void;
}

// Form state types
export interface FormState<T = Record<string, unknown>> {
  data: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}

export interface FormActions<T = Record<string, unknown>> {
  setFieldValue: (field: keyof T, value: unknown) => void;
  setFieldError: (field: keyof T, error: string) => void;
  setFieldTouched: (field: keyof T, touched: boolean) => void;
  validateField: (field: keyof T) => Promise<boolean>;
  validateForm: () => Promise<boolean>;
  resetForm: (data?: Partial<T>) => void;
  submitForm: () => Promise<void>;
}

// Type helpers for form data transformation
export type FormDataToEntity<T> = T extends ClientFormData
  ? Omit<Client, "id" | "user_id" | "created_at">
  : T extends EventFormData
  ? Omit<Event, "id" | "user_id" | "created_at"> & {
      start: string;
      end: string;
    }
  : T extends BookingFormData
  ? Omit<Booking, "id" | "user_id" | "created_at"> & {
      start: string;
      end: string;
    }
  : T extends AvailabilityFormData
  ? Omit<Availability, "id" | "user_id">
  : T extends EventTypeFormData
  ? Omit<EventType, "id" | "user_id" | "created_at" | "updated_at">
  : never;

export type EntityToFormData<T> = T extends Client
  ? ClientFormData
  : T extends Event
  ? EventFormData & { start: Date; end: Date }
  : T extends Booking
  ? BookingFormData & { start: Date; end: Date }
  : T extends Availability
  ? AvailabilityFormData
  : T extends EventType
  ? EventTypeFormData
  : never;
