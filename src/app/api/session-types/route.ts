import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

type CookieStore = Awaited<ReturnType<typeof cookies>>;

async function createSupabaseClient() {
  const store: CookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) => {
            store.set(name, value, options);
          });
        },
      },
    }
  );
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 60);
}

function handleError(e: unknown, status = 400) {
  console.error("API/session-types error", e);
  const message = (e as any)?.message ?? "unknown";
  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  try {
    const supabase = await createSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return handleError("Unauthorized", 401);
    }

    const { data: sessionTypes, error } = await supabase
      .from("event_types")
      .select("*")
      .eq("user_id", user.id)
      .order("title", { ascending: true });

    if (error) throw error;

    // Parse JSON fields for response
    const parsedSessionTypes =
      sessionTypes?.map((sessionType: any) => ({
        ...sessionType,
        locations: sessionType.locations
          ? JSON.parse(sessionType.locations as string)
          : [],
        metadata: sessionType.metadata
          ? JSON.parse(sessionType.metadata as string)
          : {},
        bookingFields: sessionType.bookingFields
          ? JSON.parse(sessionType.bookingFields as string)
          : [],
        bookingLimits: sessionType.bookingLimits
          ? JSON.parse(sessionType.bookingLimits as string)
          : {},
        durationLimits: sessionType.durationLimits
          ? JSON.parse(sessionType.durationLimits as string)
          : {},
        recurringEvent: sessionType.recurringEvent
          ? JSON.parse(sessionType.recurringEvent as string)
          : null,
      })) || [];

    return NextResponse.json(parsedSessionTypes);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return handleError("Unauthorized", 401);
    }

    const body = await request.json();

    if (!body.title) {
      return handleError("Title is required", 400);
    }

    // Generate slug from title if not provided, or use provided slug
    const slug = body.slug ? slugify(body.slug) : slugify(body.title);

    // Check uniqueness per user
    const { data: clash } = await supabase
      .from("event_types")
      .select("id")
      .eq("user_id", user.id)
      .eq("slug", slug)
      .maybeSingle();

    if (clash) {
      return handleError("Slug already in use", 400);
    }

    const newSessionType = {
      title: body.title,
      slug,
      description: body.description || "",
      length: body.length || 30,
      hidden: body.hidden || false,
      position: body.position || 0,
      eventName: body.eventName,
      timeZone: body.timeZone,
      schedulingType: body.schedulingType,
      user_id: user.id,

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
      locations: JSON.stringify(body.locations || []),
      metadata: JSON.stringify(body.metadata || {}),
      bookingFields: JSON.stringify(body.bookingFields || []),
      bookingLimits: JSON.stringify(body.bookingLimits || {}),
      durationLimits: JSON.stringify(body.durationLimits || {}),

      // Recurring events
      recurringEvent: body.recurringEvent ? JSON.stringify(body.recurringEvent) : null,

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

    const { data: createdSessionType, error } = await supabase
      .from("event_types")
      .insert(newSessionType)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(createdSessionType, { status: 201 });
  } catch (e) {
    return handleError(e);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return handleError("Session Type ID required", 400);
    }

    const supabase = await createSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return handleError("Unauthorized", 401);
    }

    const body = await request.json();

    // If slug is being updated, check uniqueness
    if (body.slug) {
      const slug = slugify(body.slug);
      const { data: clash } = await supabase
        .from("event_types")
        .select("id")
        .eq("user_id", user.id)
        .eq("slug", slug)
        .neq("id", id)
        .maybeSingle();

      if (clash) {
        return handleError("Slug already in use", 400);
      }
      body.slug = slug;
    }

    // Convert JSON fields to strings if present
    if (body.locations) body.locations = JSON.stringify(body.locations);
    if (body.metadata) body.metadata = JSON.stringify(body.metadata);
    if (body.bookingFields) body.bookingFields = JSON.stringify(body.bookingFields);
    if (body.bookingLimits) body.bookingLimits = JSON.stringify(body.bookingLimits);
    if (body.durationLimits) body.durationLimits = JSON.stringify(body.durationLimits);
    if (body.recurringEvent) body.recurringEvent = JSON.stringify(body.recurringEvent);

    const { data: updatedSessionType, error } = await supabase
      .from("event_types")
      .update(body)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(updatedSessionType);
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return handleError("Session Type ID required", 400);
    }

    const supabase = await createSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return handleError("Unauthorized", 401);
    }

    const { error } = await supabase
      .from("event_types")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (e) {
    return handleError(e);
  }
}
