import { NextRequest, NextResponse } from "next/server";

import { toSnakeEventType, fromSnakeEventType } from "@/lib/field-mapping";
import { logErr } from "@/lib/log";
import { slugify } from "@/lib/slug";
import { supabaseServer } from "@/lib/supabase-server-client";

function handleError(e: unknown, status = 400) {
  logErr("api/session-types", e);
  const message = (e as any)?.message ?? "unknown";
  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  try {
    const supabase = await supabaseServer();
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

    // Parse JSON fields and convert to camelCase for response
    const parsedSessionTypes =
      sessionTypes?.map((sessionType: any) =>
        fromSnakeEventType(sessionType)
      ) || [];

    return NextResponse.json(parsedSessionTypes);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await supabaseServer();
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
      return NextResponse.json({ error: "slug_taken" }, { status: 409 });
    }

    // Prepare the new session type with snake_case field mapping
    const newSessionType = toSnakeEventType({
      ...body,
      slug,
      user_id: user.id,
      // Set defaults for required fields
      description: body.description || "",
      length_in_minutes: body.length_in_minutes || body.length || 30,
      hidden: body.hidden || false,
      position: body.position || 0,
      color: body.color || "indigo",
      currency: body.currency || "USD",
      price_cents:
        body.price_cents ||
        (body.price ? Math.round(parseFloat(body.price as string) * 100) : 0),
      minimum_booking_notice:
        body.minimum_booking_notice || body.minimumBookingNotice || 120,
      before_event_buffer:
        body.before_event_buffer || body.beforeEventBuffer || 0,
      after_event_buffer: body.after_event_buffer || body.afterEventBuffer || 0,
      requires_confirmation:
        body.requires_confirmation ?? body.requiresConfirmation ?? false,
      disable_guests: body.disable_guests ?? body.disableGuests ?? false,
      is_active: body.is_active ?? body.isActive ?? true,
      // Ensure JSON fields have defaults
      locations: body.locations || [],
      metadata: body.metadata || {},
      booking_fields: body.booking_fields || body.bookingFields || [],
    });

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

    const supabase = await supabaseServer();
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
        return NextResponse.json({ error: "slug_taken" }, { status: 409 });
      }
      body.slug = slug;
    }

    // Convert camelCase to snake_case and handle JSON fields
    const updateData = toSnakeEventType(body);

    const { data: updatedSessionType, error } = await supabase
      .from("event_types")
      .update(updateData)
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

    const supabase = await supabaseServer();
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
