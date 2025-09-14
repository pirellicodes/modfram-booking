// API request and response types

import type {
  Client,
  Event,
  Booking,
  Payment,
  Availability,
  EventType,
  PaginationMeta,
  BookingFilters,
  ClientFilters,
  PaginationParams,
} from "@/types";

// Base API response structure
export interface ApiResponse<TData = unknown> {
  data?: TData;
  error?: string;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  field?: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<TData> extends ApiResponse<TData[]> {
  pagination: PaginationMeta;
}

// Generic CRUD request types
export type CreateRequest<T> = Omit<
  T,
  "id" | "user_id" | "created_at" | "updated_at"
>;
export type UpdateRequest<T> = Partial<CreateRequest<T>>;

// Client API types
export interface CreateClientRequest {
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
}

export type UpdateClientRequest = Partial<CreateClientRequest>;

export interface ClientsListRequest extends PaginationParams {
  filters?: ClientFilters;
}

export type ClientResponse = ApiResponse<Client>;
export type ClientsListResponse = PaginatedResponse<Client>;

// Event API types
export interface CreateEventRequest {
  title: string;
  start: string; // ISO string
  end: string; // ISO string
  notes?: string;
}

export type UpdateEventRequest = Partial<CreateEventRequest>;

export interface EventsListRequest extends PaginationParams {
  date_from?: string;
  date_to?: string;
  search?: string;
}

export type EventResponse = ApiResponse<Event>;
export type EventsListResponse = PaginatedResponse<Event>;

// Booking API types
export interface CreateBookingRequest {
  client_id?: string;
  start: string; // ISO string
  end: string; // ISO string
  notes?: string;
  event_type_id?: string;
}

export interface UpdateBookingRequest extends Partial<CreateBookingRequest> {
  status?: Booking["status"];
}

export interface BookingsListRequest extends PaginationParams {
  filters?: BookingFilters;
}

export interface BookingWithRelations extends Booking {
  client?: Client;
  event_type?: EventType;
  payment?: Payment;
}

export type BookingResponse = ApiResponse<BookingWithRelations>;
export type BookingsListResponse = PaginatedResponse<BookingWithRelations>;

// Payment API types
export interface CreatePaymentIntentRequest {
  booking_id: string;
  amount_cents: number;
  currency?: string;
  payment_method_id?: string;
}

export interface ConfirmPaymentRequest {
  payment_intent_id: string;
  payment_method_id?: string;
}

export interface PaymentIntentResponse {
  client_secret: string;
  payment_intent_id: string;
  status: Payment["status"];
}

export type CreatePaymentResponse = ApiResponse<PaymentIntentResponse>;
export type PaymentResponse = ApiResponse<Payment>;
export type PaymentsListResponse = PaginatedResponse<Payment>;

// Availability API types
export interface CreateAvailabilityRequest {
  weekday: number;
  slots: Array<{
    start: string; // HH:mm format
    end: string; // HH:mm format
  }>;
}

export type UpdateAvailabilityRequest = Partial<CreateAvailabilityRequest>;

export type AvailabilityResponse = ApiResponse<Availability>;
export type AvailabilitiesListResponse = ApiResponse<Availability[]>;

// Event Type API types
export interface CreateEventTypeRequest {
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
}

export type UpdateEventTypeRequest = Partial<CreateEventTypeRequest>;

export interface EventTypesListRequest extends PaginationParams {
  is_active?: boolean;
  search?: string;
}

export interface EventTypeWithStats extends EventType {
  total_bookings?: number;
  revenue_cents?: number;
}

export type EventTypeResponse = ApiResponse<EventTypeWithStats>;
export type EventTypesListResponse = PaginatedResponse<EventTypeWithStats>;

// Google Calendar integration types
export type GoogleOAuthStartResponse = ApiResponse<{ auth_url: string }>;

export interface GoogleOAuthCallbackRequest {
  code: string;
  state: string;
}

export interface GoogleCalendarSyncRequest {
  booking_id: string;
  action: "create" | "update" | "delete";
}

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  description?: string;
}

export type GoogleOAuthCallbackResponse = ApiResponse<{ success: boolean }>;
export type GoogleCalendarSyncResponse = ApiResponse<GoogleCalendarEvent>;

// Dashboard analytics types
export interface DashboardStatsRequest {
  date_from?: string;
  date_to?: string;
  period?: "day" | "week" | "month" | "year";
}

export interface DashboardStats {
  total_bookings: number;
  confirmed_bookings: number;
  pending_bookings: number;
  cancelled_bookings: number;
  total_revenue_cents: number;
  bookings_growth_percent: number;
  revenue_growth_percent: number;
}

export interface ChartData {
  bookings_over_time: Array<{
    date: string;
    count: number;
  }>;
  revenue_over_time: Array<{
    date: string;
    amount_cents: number;
  }>;
  bookings_by_status: Array<{
    status: Booking["status"];
    count: number;
  }>;
  top_clients: Array<{
    client_id: string;
    client_name: string;
    booking_count: number;
    total_spent_cents: number;
  }>;
}

export interface DashboardData {
  stats: DashboardStats;
  charts: ChartData;
}

export type DashboardResponse = ApiResponse<DashboardData>;

// Search and autocomplete types
export interface SearchRequest {
  query: string;
  type?: "clients" | "events" | "bookings" | "all";
  limit?: number;
}

export interface SearchResult {
  id: string;
  type: "client" | "event" | "booking";
  title: string;
  subtitle?: string;
  data: Client | Event | Booking;
}

export type SearchResponse = ApiResponse<SearchResult[]>;

// File upload types (for future use)
export interface FileUploadRequest {
  file: File;
  type: "avatar" | "document" | "image";
}

export interface UploadedFile {
  id: string;
  url: string;
  filename: string;
  size: number;
  mime_type: string;
  created_at: string;
}

export type FileUploadResponse = ApiResponse<UploadedFile>;

// Webhook types for external integrations
export interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  is_active: boolean;
  secret: string;
  created_at: string;
}

export interface CreateWebhookRequest {
  url: string;
  events: string[];
  is_active?: boolean;
}

export type WebhookResponse = ApiResponse<WebhookEndpoint>;
export type WebhooksListResponse = ApiResponse<WebhookEndpoint[]>;

// Batch operation types
export interface BatchRequest<T> {
  operations: Array<{
    action: "create" | "update" | "delete";
    data: T;
    id?: string;
  }>;
}

export interface BatchResult<T> {
  operation: string;
  success: boolean;
  data?: T;
  error?: string;
}

export interface BatchResponse<T> extends ApiResponse {
  results: BatchResult<T>[];
  total: number;
  successful: number;
  failed: number;
}
