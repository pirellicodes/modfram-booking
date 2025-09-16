import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type CookieStore = Awaited<ReturnType<typeof cookies>>;

async function sb() {
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

function err(e: unknown, status = 400) {
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

export async function GET() {
  try {
    const supabase = await sb();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return err("unauthenticated", 401);

    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
        id, user_id, client_id, client_name, client_email, client_phone,
        status, notes, created_at, booking_date, booking_time, updated_at,
        event_type_id, service_type_id
      `
      )
      .eq("user_id", user.id)
      .order("booking_date", { ascending: true })
      .order("booking_time", { ascending: true });

    if (error) throw error;

    const enriched = (data ?? []).map((b) => {
      const start_time = combineDateTime(b.booking_date, b.booking_time);
      const end_time = start_time
        ? new Date(
            new Date(start_time).getTime() + 30 * 60 * 1000
          ).toISOString()
        : null;
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

    const supabase = await sb();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return err("unauthenticated", 401);
    if (!body.client_name) return err("client_name is required", 400);
    if (!body.booking_date) return err("booking_date is required", 400);
    if (!body.booking_time) return err("booking_time is required", 400);

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
      })
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

    return NextResponse.json(
      { ...data, start_time, end_time },
      { status: 201 }
    );
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

    const supabase = await sb();
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

    const supabase = await sb();
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
