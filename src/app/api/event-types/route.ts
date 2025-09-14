import { NextRequest, NextResponse } from "next/server";

import { supabaseServer } from "@/lib/supabase-server";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove non-word chars except spaces and hyphens
    .replace(/[\s_-]+/g, "-") // Replace spaces, underscores and multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

export async function GET() {
  try {
    const supabase = await supabaseServer();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: eventTypes, error } = await supabase
      .from("event_types")
      .select("*")
      .order("position", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching event types:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch event types" },
        { status: 500 }
      );
    }

    // Parse JSON fields for response
    const parsedEventTypes =
      eventTypes?.map((eventType) => ({
        ...eventType,
        locations: eventType.locations
          ? JSON.parse(eventType.locations as string)
          : [],
        metadata: eventType.metadata
          ? JSON.parse(eventType.metadata as string)
          : {},
        bookingFields: eventType.bookingFields
          ? JSON.parse(eventType.bookingFields as string)
          : [],
        bookingLimits: eventType.bookingLimits
          ? JSON.parse(eventType.bookingLimits as string)
          : {},
        durationLimits: eventType.durationLimits
          ? JSON.parse(eventType.durationLimits as string)
          : {},
        recurringEvent: eventType.recurringEvent
          ? JSON.parse(eventType.recurringEvent as string)
          : null,
      })) || [];

    return NextResponse.json({
      success: true,
      data: parsedEventTypes,
    });
  } catch (error) {
    console.error("Error fetching event types:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch event types" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await supabaseServer();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.title) {
      return NextResponse.json(
        { success: false, error: "Title is required" },
        { status: 400 }
      );
    }

    // Generate slug from title if not provided
    const slug = body.slug || slugify(body.title);

    // Check if slug already exists for this user
    const { data: existingEventType } = await supabase
      .from("event_types")
      .select("id")
      .eq("slug", slug)
      .single();

    if (existingEventType) {
      return NextResponse.json(
        { success: false, error: "Event type with this slug already exists" },
        { status: 400 }
      );
    }

    const newEventType = {
      title: body.title,
      slug,
      description: body.description || "",
      length: body.length || 30,
      hidden: body.hidden || false,
      position: body.position || 0,
      eventName: body.eventName,
      timeZone: body.timeZone,
      schedulingType: body.schedulingType,
      user_id: user.id, // Ensure user ownership

      // Booking limits
      periodType: body.periodType || "UNLIMITED",
      periodStartDate: body.periodStartDate || null,
      periodEndDate: body.periodEndDate || null,
      periodDays: body.periodDays,
      periodCountCalendarDays: body.periodCountCalendarDays || false,

      // Confirmation and guest settings
      requiresConfirmation: body.requiresConfirmation || false,
      disableGuests: body.disableGuests || false,
      hideCalendarNotes: body.hideCalendarNotes || false,
      minimumBookingNotice: body.minimumBookingNotice || 120,

      // Buffer times
      beforeEventBuffer: body.beforeEventBuffer || 0,
      afterEventBuffer: body.afterEventBuffer || 0,

      // Pricing
      price: body.price || "0.00",
      currency: body.currency || "USD",
      is_paid: body.is_paid || false,
      deposit_cents: body.deposit_cents || null,
      require_agreement: body.require_agreement || false,
      agreement_text: body.agreement_text || null,

      // Cancellation
      allow_cancellation: body.allow_cancellation !== false,

      // Slot settings
      slotInterval: body.slotInterval,
      successRedirectUrl: body.successRedirectUrl,
      onlyShowFirstAvailableSlot: body.onlyShowFirstAvailableSlot || false,

      // Advanced settings (JSON fields)
      locations: body.locations || [],
      metadata: body.metadata || {},
      bookingFields: body.bookingFields || [],
      bookingLimits: body.bookingLimits || {},
      durationLimits: body.durationLimits || {},

      // Recurring events
      recurringEvent: body.recurringEvent || null,

      // Seats
      seatsPerTimeSlot: body.seatsPerTimeSlot,
      seatsShowAttendees: body.seatsShowAttendees || false,
      seatsShowAvailabilityCount: body.seatsShowAvailabilityCount !== false,

      // Relations
      teamId: body.teamId,
      parentId: body.parentId,
      scheduleId: body.scheduleId,

      // Hosting
      assignAllTeamMembers: body.assignAllTeamMembers || false,
    };

    const { data: createdEventType, error } = await supabase
      .from("event_types")
      .insert(newEventType)
      .select()
      .single();

    if (error) {
      console.error("Error creating event type:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: createdEventType,
    });
  } catch (error) {
    console.error("Error creating event type:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create event type" },
      { status: 500 }
    );
  }
}
