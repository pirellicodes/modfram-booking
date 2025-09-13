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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = supabaseServer();

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

    const { data: eventType, error } = await supabase
      .from("event_types")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error || !eventType) {
      return NextResponse.json(
        { success: false, error: "Event type not found" },
        { status: 404 }
      );
    }

    // Parse JSON fields
    const responseEventType = {
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
    };

    return NextResponse.json({
      success: true,
      data: responseEventType,
    });
  } catch (error) {
    console.error("Error fetching event type:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch event type" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = supabaseServer();

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

    // Check if event type exists and user owns it
    const { data: existingEventType, error: fetchError } = await supabase
      .from("event_types")
      .select("*")
      .eq("id", params.id)
      .single();

    if (fetchError || !existingEventType) {
      return NextResponse.json(
        { success: false, error: "Event type not found" },
        { status: 404 }
      );
    }

    // Handle slug generation if title is being updated
    let slug = body.slug;
    if (body.title && !slug) {
      slug = slugify(body.title);
    }

    // Check if slug already exists (excluding current event type)
    if (slug && slug !== existingEventType.slug) {
      const { data: existingWithSlug } = await supabase
        .from("event_types")
        .select("id")
        .eq("slug", slug)
        .neq("id", params.id)
        .single();

      if (existingWithSlug) {
        return NextResponse.json(
          { success: false, error: "Event type with this slug already exists" },
          { status: 400 }
        );
      }
    }

    const updateData: Record<string, unknown> = {
      ...body,
      updated_at: new Date().toISOString(),
    };

    // Handle slug update
    if (slug) {
      updateData.slug = slug;
    }

    // Ensure JSON fields are properly handled
    if (body.locations !== undefined) {
      updateData.locations = body.locations;
    }
    if (body.metadata !== undefined) {
      updateData.metadata = body.metadata;
    }
    if (body.bookingFields !== undefined) {
      updateData.bookingFields = body.bookingFields;
    }
    if (body.bookingLimits !== undefined) {
      updateData.bookingLimits = body.bookingLimits;
    }
    if (body.durationLimits !== undefined) {
      updateData.durationLimits = body.durationLimits;
    }
    if (body.recurringEvent !== undefined) {
      updateData.recurringEvent = body.recurringEvent;
    }

    const { data: updatedEventType, error } = await supabase
      .from("event_types")
      .update(updateData)
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating event type:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedEventType,
    });
  } catch (error) {
    console.error("Error updating event type:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update event type" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = supabaseServer();

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

    // Check if event type exists and user owns it
    const { data: existingEventType, error: fetchError } = await supabase
      .from("event_types")
      .select("id")
      .eq("id", params.id)
      .single();

    if (fetchError || !existingEventType) {
      return NextResponse.json(
        { success: false, error: "Event type not found" },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from("event_types")
      .delete()
      .eq("id", params.id);

    if (error) {
      console.error("Error deleting event type:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Event type deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting event type:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete event type" },
      { status: 500 }
    );
  }
}
