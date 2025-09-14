import {
  boolean,
  decimal,
  integer,
  json,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description").notNull(),
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }).notNull(),
  startTime: varchar("start_time", { length: 5 }).notNull(),
  endTime: varchar("end_time", { length: 5 }).notNull(),
  isRepeating: boolean("is_repeating").notNull(),
  repeatingType: varchar("repeating_type", {
    length: 10,
    enum: ["daily", "weekly", "monthly"],
  }).$type<"daily" | "weekly" | "monthly">(),
  location: varchar("location", { length: 256 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  color: varchar("color", { length: 15 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const eventTypes = pgTable("event_types", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 256 }).notNull(),
  slug: varchar("slug", { length: 256 }).notNull().unique(),
  description: text("description"),
  length: integer("length").notNull().default(30), // duration in minutes
  hidden: boolean("hidden").notNull().default(false),
  position: integer("position").notNull().default(0),
  eventName: varchar("event_name", { length: 256 }),
  timeZone: varchar("time_zone", { length: 50 }),
  schedulingType: varchar("scheduling_type", { length: 50 }), // COLLECTIVE, ROUND_ROBIN, MANAGED

  // Booking limits
  periodType: varchar("period_type", { length: 20 }).default("UNLIMITED"), // UNLIMITED, ROLLING, RANGE
  periodStartDate: timestamp("period_start_date", { withTimezone: true }),
  periodEndDate: timestamp("period_end_date", { withTimezone: true }),
  periodDays: integer("period_days"),
  periodCountCalendarDays: boolean("period_count_calendar_days").default(false),

  // Confirmation and guest settings
  requiresConfirmation: boolean("requires_confirmation").default(false),
  disableGuests: boolean("disable_guests").default(false),
  hideCalendarNotes: boolean("hide_calendar_notes").default(false),
  minimumBookingNotice: integer("minimum_booking_notice").default(120), // minutes

  // Buffer times
  beforeEventBuffer: integer("before_event_buffer").default(0), // minutes
  afterEventBuffer: integer("after_event_buffer").default(0), // minutes

  // Pricing
  price: decimal("price", { precision: 10, scale: 2 }).default("0.00"),
  currency: varchar("currency", { length: 3 }).default("USD"),

  // Slot settings
  slotInterval: integer("slot_interval"), // minutes
  successRedirectUrl: text("success_redirect_url"),
  onlyShowFirstAvailableSlot: boolean("only_show_first_available_slot").default(
    false
  ),

  // Advanced settings
  locations: json("locations"), // array of location objects
  metadata: json("metadata"),
  bookingFields: json("booking_fields"),
  bookingLimits: json("booking_limits"), // per day/week/month/year limits
  durationLimits: json("duration_limits"), // min/max duration limits

  // Recurring events
  recurringEvent: json("recurring_event"), // frequency, interval, count, until

  // Seats
  seatsPerTimeSlot: integer("seats_per_time_slot"),
  seatsShowAttendees: boolean("seats_show_attendees").default(false),
  seatsShowAvailabilityCount: boolean("seats_show_availability_count").default(
    true
  ),

  // Relations
  userId: uuid("user_id"), // owner of event type
  teamId: uuid("team_id"), // if team event
  parentId: uuid("parent_id"), // for child event types
  scheduleId: uuid("schedule_id"), // default schedule

  // Hosting
  assignAllTeamMembers: boolean("assign_all_team_members").default(false),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type EventTypes = typeof events.$inferSelect;
export type newEvent = typeof events.$inferInsert;
export type EventType = typeof eventTypes.$inferSelect;
export type NewEventType = typeof eventTypes.$inferInsert;
