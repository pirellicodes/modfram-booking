export type Database = import("@/lib/database.types").Database;
export type EventType = Database["public"]["Tables"]["event_types"]["Row"];
export type NewEventType =
  Database["public"]["Tables"]["event_types"]["Insert"];
export type UpdateEventType =
  Database["public"]["Tables"]["event_types"]["Update"];
export type Availability = Database["public"]["Tables"]["availability"]["Row"];
export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
