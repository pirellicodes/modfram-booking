import { NextResponse } from "next/server";

import { logErr } from "@/lib/log";
import { supabaseServer } from "@/lib/supabase-server-client";

function err(e: unknown, status = 400) {
  logErr("api/bookings", e);
  const msg = (e as any)?.message ?? "bad request";
  return NextResponse.json({ error: msg }, { status });
}

function combineDateTime(
  dateStr?: string | null,
  timeStr?: string | null
): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (timeStr) {
    const [hh, mm, ss] = timeStr.split(":").map(Number);
    d.setUTCHours(hh ?? 0, mm ?? 0, ss ?? 0, 0);
  }
  return d.toISOString();
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    const supabase = await supabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return err("unauthenticated", 401);

    let query = supabase
      .from("bookings")
      .select(
        `
        id, user_id, client_id, client_name, client_email, client_phone,
        status, notes, created_at, booking_date, booking_time, updated_at,
        event_type_id, service_type_id, total_price, start_time, end_time
      `
      )
      .eq("user_id", user.id);

    // Add date range filters if provided
    if (start) {
      query = query.gte("start_time", start);
    }
    if (end) {
      query = query.lte("start_time", end);
    }

    query = query
      .order("booking_date", { ascending: true })
      .order("booking_time", { ascending: true });

    const { data, error } = await query;

    if (error) throw error;

    // Return bookings with computed times if start_time/end_time are null
    const enriched = (data ?? []).map((b) => {
      let start_time = b.start_time;
      let end_time = b.end_time;

      // Fallback computation if times are missing
      if (!start_time && b.booking_date && b.booking_time) {
        start_time = combineDateTime(b.booking_date, b.booking_time);
      }
      if (!end_time && start_time) {
        end_time = new Date(
          new Date(start_time).getTime() + 30 * 60 * 1000
        ).toISOString();
      }

      return { ...b, start_time, end_time };
    });

    return NextResponse.json(enriched);
  } catch (e) {
    return err(e);
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      client_name: string;
      client_email?: string | null;
      client_phone?: string | null;
      booking_date: string; // YYYY-MM-DD
      booking_time: string; // HH:MM:SS
      notes?: string | null;
      status?: string | null;
      client_id?: string | null;
      event_type_id?: string | null;
      service_type_id?: string | null;
    };

    const supabase = await supabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return err("unauthenticated", 401);
    if (!body.client_name) return err("client_name is required", 400);
    if (!body.booking_date) return err("booking_date is required", 400);
    if (!body.booking_time) return err("booking_time is required", 400);

    // Fetch session type details if provided to compute total_price and duration
    let total_price = 0;
    let duration = 30; // default 30 minutes

    if (body.event_type_id) {
      const { data: sessionType } = await supabase
        .from("event_types")
        .select("price_cents, length_in_minutes, length")
        .eq("id", body.event_type_id)
        .single();

      if (sessionType) {
        if (sessionType.price_cents != null) {
          total_price = sessionType.price_cents;
        }
        if (sessionType.length_in_minutes) {
          duration = sessionType.length_in_minutes;
        } else if (sessionType.length) {
          duration = sessionType.length;
        }
      }
    }

    // Compute start_time and end_time
    const start_time = combineDateTime(body.booking_date, body.booking_time);
    const end_time = start_time
      ? new Date(
          new Date(start_time).getTime() + duration * 60 * 1000
        ).toISOString()
      : null;

    // Validate end_time is not before start_time
    if (start_time && end_time && new Date(end_time) < new Date(start_time)) {
      return NextResponse.json(
        {
          error: "end_before_start",
          hint: "End time cannot be before start time",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("bookings")
      .insert({
        user_id: user.id,
        client_id: body.client_id ?? null,
        client_name: body.client_name,
        client_email: body.client_email ?? null,
        client_phone: body.client_phone ?? null,
        booking_date: body.booking_date,
        booking_time: body.booking_time,
        status: body.status ?? "pending",
        notes: body.notes ?? null,
        event_type_id: body.event_type_id ?? null,
        service_type_id: body.service_type_id ?? null,
        total_price, // Ensure total_price is always provided
        start_time,
        end_time,
      })
      .select(
        `id, user_id, client_id, client_name, client_email, client_phone,
         status, notes, booking_date, booking_time, created_at, updated_at,
         event_type_id, service_type_id, total_price, start_time, end_time`
      )
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    return err(e);
  }
}

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return err("Booking ID required", 400);

    const body = (await req.json()) as {
      client_name?: string;
      client_email?: string | null;
      client_phone?: string | null;
      booking_date?: string;
      booking_time?: string;
      notes?: string | null;
      status?: string | null;
    };

    const supabase = await supabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return err("unauthenticated", 401);

    const { data, error } = await supabase
      .from("bookings")
      .update({
        client_name: body.client_name,
        client_email: body.client_email,
        client_phone: body.client_phone,
        booking_date: body.booking_date,
        booking_time: body.booking_time,
        status: body.status,
        notes: body.notes,
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select(
        `id, user_id, client_id, client_name, client_email, client_phone,
         status, notes, booking_date, booking_time, created_at, updated_at,
         event_type_id, service_type_id`
      )
      .single();

    if (error) throw error;

    const start_time = combineDateTime(data.booking_date, data.booking_time);
    const end_time = start_time
      ? new Date(new Date(start_time).getTime() + 30 * 60 * 1000).toISOString()
      : null;

    return NextResponse.json({ ...data, start_time, end_time });
  } catch (e) {
    return err(e);
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return err("Booking ID required", 400);

    const supabase = await supabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return err("unauthenticated", 401);

    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e) {
    return err(e);
  }
}
