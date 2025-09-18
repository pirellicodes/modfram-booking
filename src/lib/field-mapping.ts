// Utility for mapping camelCase fields to snake_case for PostgREST compatibility

export function toSnakeEventType(data: any) {
  const mapped = { ...data };

  // Field mappings for event_types table with safe fallbacks
  const fieldMappings = {
    // Buffer times
    beforeEventBuffer: "before_event_buffer",
    afterEventBuffer: "after_event_buffer",

    // Duration and pricing
    length: "length_in_minutes",
    lengthInMinutes: "length_in_minutes",
    lengthInMinutesOptions: "length_in_minutes_options",
    priceCents: "price_cents",

    // Booking settings
    minimumBookingNotice: "minimum_booking_notice",
    requiresConfirmation: "requires_confirmation",
    disableGuests: "disable_guests",
    isInstantEvent: "is_instant_event",
    isActive: "is_active",

    // Timing
    slotInterval: "slot_interval",

    // JSON fields (keep as-is but stringify if needed)
    bookingFields: "booking_fields",

    // Schedule
    scheduleId: "schedule_id",
  };

  // Apply field mappings with safety checks
  for (const [camelKey, snakeKey] of Object.entries(fieldMappings)) {
    if (camelKey in mapped) {
      mapped[snakeKey] = mapped[camelKey];
      // Keep the camelCase version for backward compatibility unless it conflicts
      if (camelKey !== snakeKey) {
        delete mapped[camelKey];
      }
    }
  }

  // Apply defaults for critical fields that must exist in database
  const defaults = {
    length_in_minutes: mapped.length_in_minutes ?? mapped.lengthInMinutes ?? 30,
    price_cents: mapped.price_cents ?? mapped.priceCents ?? 0,
    before_event_buffer:
      mapped.before_event_buffer ?? mapped.beforeEventBuffer ?? 0,
    after_event_buffer:
      mapped.after_event_buffer ?? mapped.afterEventBuffer ?? 0,
    color: mapped.color ?? "indigo",
    requires_confirmation:
      mapped.requires_confirmation ?? mapped.requiresConfirmation ?? false,
    disable_guests: mapped.disable_guests ?? mapped.disableGuests ?? false,
    is_active: mapped.is_active ?? mapped.isActive ?? true,
  };

  // Apply defaults
  Object.assign(mapped, defaults);

  // Handle JSON fields - stringify if they're objects
  const jsonFields = [
    "locations",
    "metadata",
    "booking_fields",
    "bookingLimits",
    "durationLimits",
    "recurringEvent",
  ];
  for (const field of jsonFields) {
    if (
      field in mapped &&
      typeof mapped[field] === "object" &&
      mapped[field] !== null
    ) {
      mapped[field] = JSON.stringify(mapped[field]);
    }
  }

  return mapped;
}

export function fromSnakeEventType(data: any) {
  const mapped = { ...data };

  // Reverse field mappings for response
  const reverseFieldMappings = {
    before_event_buffer: "beforeEventBuffer",
    after_event_buffer: "afterEventBuffer",
    length_in_minutes: "lengthInMinutes",
    length_in_minutes_options: "lengthInMinutesOptions",
    price_cents: "priceCents",
    minimum_booking_notice: "minimumBookingNotice",
    requires_confirmation: "requiresConfirmation",
    disable_guests: "disableGuests",
    is_instant_event: "isInstantEvent",
    is_active: "isActive",
    slot_interval: "slotInterval",
    booking_fields: "bookingFields",
    schedule_id: "scheduleId",
  };

  // Apply reverse mappings
  for (const [snakeKey, camelKey] of Object.entries(reverseFieldMappings)) {
    if (snakeKey in mapped) {
      mapped[camelKey] = mapped[snakeKey];
      delete mapped[snakeKey];
    }
  }

  // Parse JSON fields
  const jsonFields = [
    "locations",
    "metadata",
    "bookingFields",
    "bookingLimits",
    "durationLimits",
    "recurringEvent",
  ];
  for (const field of jsonFields) {
    if (field in mapped && typeof mapped[field] === "string") {
      try {
        mapped[field] = JSON.parse(mapped[field]);
      } catch {
        // Keep as string if parsing fails
      }
    }
  }

  return mapped;
}
