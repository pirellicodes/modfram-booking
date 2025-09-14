// Core domain types for the booking platform

// Utility types
export type DateInput = Date | string | number;
export type ISOString = string;
export type TimeString = string; // HH:mm format

export type WithTimestamps<T> = T & {
  created_at: string;
  updated_at?: string;
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Database entity types
export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
  created_at: string;
}

export interface Event {
  id: string;
  user_id: string;
  title: string;
  start: string; // ISO string
  end: string; // ISO string
  notes?: string;
  created_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  client_id?: string;
  client?: Client;
  start: string; // ISO string
  end: string; // ISO string
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes?: string;
  created_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  booking_id?: string;
  booking?: Booking;
  amount_cents: number;
  currency: string;
  stripe_payment_intent_id?: string;
  status:
    | "requires_payment_method"
    | "requires_confirmation"
    | "processing"
    | "succeeded"
    | "failed";
  created_at: string;
}

export interface TimeSlot {
  start: string; // HH:mm format
  end: string; // HH:mm format
}

export interface Availability {
  id: string;
  user_id: string;
  weekday: number; // 0-6 (Sunday = 0)
  slots: TimeSlot[];
}

export interface UserIntegration {
  id: string;
  user_id: string;
  integration_type: "google_calendar" | "stripe";
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: string;
  integration_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Event type definitions for event-types functionality
export interface EventType {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  length: number; // duration in minutes - matches database schema
  price?: number; // price in dollars - matches database schema
  buffer_time_minutes?: number;
  max_bookings_per_day?: number;
  requires_confirmation?: boolean;
  is_active: boolean;
  booking_window_days?: number;
  minimum_notice_hours?: number;
  created_at: string;
  updated_at?: string;
}

// Chart and dashboard data types
export interface ChartDataPoint {
  name: string;
  value: number;
  date?: string;
}

export interface DashboardMetrics {
  total_bookings: number;
  confirmed_bookings: number;
  pending_bookings: number;
  total_revenue_cents: number;
  bookings_this_month: number;
  revenue_this_month_cents: number;
}

// Calendar-specific types
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: unknown;
  extendedProps?: Record<string, unknown>;
}

export interface CalendarSlotInfo {
  start: Date;
  end: Date;
  slots?: Date[];
  action: "select" | "click" | "doubleClick";
}

// Filter and search types
export interface BookingFilters {
  status?: Booking["status"][];
  client_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface ClientFilters {
  search?: string;
  has_bookings?: boolean;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next_page: boolean;
  has_prev_page: boolean;
}
