import type { CalendarEvent } from "@/types/calendar";
import type { LocationObject } from "@/types/location";

// Accepts legacy shapes and normalizes to CalendarEvent
export function toCalendarEvent(input: any): CalendarEvent {
  // legacy fields that may exist
  const startDate = input.startDate ?? input.start ?? input.start_date ?? null;
  const endDate = input.endDate ?? input.end ?? input.end_date ?? null;
  const startTime = input.startTime ?? input.start_time ?? null;
  const endTime = input.endTime ?? input.end_time ?? null;

  const start = coerceDate(startDate, startTime);
  const end = coerceDate(endDate ?? startDate, endTime);

  return {
    id: String(input.id ?? cryptoRandomId()),
    title: String(input.title ?? input.name ?? "Untitled"),
    start,
    end,
    allDay: Boolean(input.allDay ?? input.all_day ?? false),
    location: normalizeLocation(input.location ?? input.locations?.[0] ?? null),
    description: input.description ?? null,
    category: input.category ?? null,
    color: input.color ?? input.event_types?.color ?? "blue",
    attendees: Array.isArray(input.attendees) ? input.attendees : [],
    metadata: (input.metadata ?? {}) as Record<string, unknown>,
  };
}

export function toCalendarEvents(arr: unknown): CalendarEvent[] {
  if (!Array.isArray(arr)) return [];
  return arr.map(toCalendarEvent);
}

function coerceDate(dateLike: any, timeLike: any): Date {
  if (dateLike instanceof Date) return dateLike;
  if (typeof dateLike === "string") {
    if (typeof timeLike === "string" && timeLike.length) {
      return new Date(`${dateLike}T${timeLike}`);
    }
    return new Date(dateLike);
  }
  // fallback now
  return new Date();
}

function normalizeLocation(loc: any): LocationObject | null {
  if (!loc) return null;
  if (typeof loc === "string") return { type: "custom", address: loc };
  const type = (loc.type ?? "custom") as LocationObject["type"];
  return {
    type,
    address: loc.address,
    link: loc.link,
    phone: loc.phone,
    displayLocationPublicly: Boolean(loc.displayLocationPublicly ?? false),
  };
}

function cryptoRandomId() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `id_${Math.random().toString(36).slice(2)}`
  );
}
