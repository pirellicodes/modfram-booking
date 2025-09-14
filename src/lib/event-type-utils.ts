import type { EventType } from "@/db/schema";
import type { EventTypeWithParsedFields } from "@/types/event-types";
import type { EventTypeFormData } from "@/types/forms";

/**
 * Transform database EventType to EventTypeWithParsedFields
 */
export function transformEventTypeWithParsedFields(
  e: EventType
): EventTypeWithParsedFields {
  return {
    ...e,
    metadata: (e as any).metadata ?? {},
    locations: Array.isArray((e as any).locations) ? (e as any).locations : [],
    bookingFields: Array.isArray((e as any).bookingFields)
      ? (e as any).bookingFields
      : [],
    bookingLimits: (e as any).bookingLimits ?? {},
    durationLimits: (e as any).durationLimits ?? {},
    recurringEvent: (e as any).recurringEvent ?? undefined,
    // Add alias fields for component compatibility
    price_cents: (e as any).price_cents ?? 0,
    duration_minutes: e.length, // length is the duration in minutes
  };
}

/**
 * Transform database EventType to form-ready EventTypeFormData
 */
export function eventTypeToFormData(eventType: EventType): EventTypeFormData {
  return {
    title: eventType.title || "",
    slug: eventType.slug || "",
    description: eventType.description || "",
    length: eventType.length || 30,
    locations: Array.isArray(eventType.locations) ? eventType.locations : [],
    price_cents:
      typeof eventType.price === "string"
        ? Math.round(parseFloat(eventType.price) * 100)
        : typeof eventType.price === "number"
        ? Math.round(eventType.price * 100)
        : 0,
    currency: eventType.currency || "USD",
    requiresConfirmation: eventType.requiresConfirmation || false,
    disableGuests: eventType.disableGuests || false,
    hideCalendarNotes: eventType.hideCalendarNotes || false,
    minimumBookingNotice: eventType.minimumBookingNotice || 120,
    beforeEventBuffer: eventType.beforeEventBuffer || 0,
    afterEventBuffer: eventType.afterEventBuffer || 0,
    bookingFields: Array.isArray(eventType.bookingFields)
      ? eventType.bookingFields
      : [],
    bookingLimits: (eventType.bookingLimits as Record<string, unknown>) || {},
    durationLimits: (eventType.durationLimits as Record<string, unknown>) || {},
    recurringEvent: eventType.recurringEvent || undefined,
    metadata: (eventType.metadata as Record<string, unknown>) || {},
  };
}

/**
 * Transform form EventTypeFormData to database-ready EventType
 */
export function formDataToEventType(
  formData: EventTypeFormData
): Partial<EventType> {
  return {
    title: formData.title,
    slug: formData.slug,
    description: formData.description,
    length: formData.length,
    locations: JSON.stringify(formData.locations),
    price: formData.price_cents ? (formData.price_cents / 100).toString() : "0",
    currency: formData.currency,
    requiresConfirmation: formData.requiresConfirmation,
    disableGuests: formData.disableGuests,
    hideCalendarNotes: formData.hideCalendarNotes,
    minimumBookingNotice: formData.minimumBookingNotice,
    beforeEventBuffer: formData.beforeEventBuffer,
    afterEventBuffer: formData.afterEventBuffer,
    bookingFields: JSON.stringify(formData.bookingFields),
    bookingLimits: JSON.stringify(formData.bookingLimits),
    durationLimits: JSON.stringify(formData.durationLimits),
    recurringEvent: formData.recurringEvent
      ? JSON.stringify(formData.recurringEvent)
      : null,
    metadata: JSON.stringify(formData.metadata),
  };
}
