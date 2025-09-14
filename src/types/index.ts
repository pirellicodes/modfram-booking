// Clean exports for all types used throughout the application
export type { CalendarEvent } from "./calendar";
export type { EventTypeWithParsedFields,RecurringEvent } from "./event-types";
export type { EventTypeFormData } from "./forms";
export type { LocationObject, LocationType } from "./location";

// Database schema types
export type { EventType, NewEventType } from "@/db/schema";

// Additional common types
export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed";
  createdAt: Date;
  updatedAt: Date;
}

export type DateInput = string | Date;
export type ISOString = string;
export type TimeString = string;
