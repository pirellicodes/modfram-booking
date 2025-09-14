import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type CookieStore = {
  get(name: string): { value: string } | undefined;
  set(name: string, value: string, options?: Record<string, unknown>): void;
  delete(name: string): void;
};

function sb() {
  const store = cookies() as unknown as CookieStore;
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return store.get(name)?.value;
        },
        set(name: string, value: string, options?: Record<string, unknown>) {
          store.set(name, value, options);
        },
        remove(name: string) {
          store.delete(name);
        },
      },
    }
  );
}

export async function GET() {
  try {
    const supabase = sb();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
        *,
        clients!inner(id, name, email, phone)
      `
      )
      .eq("user_id", user.id)
      .order("start_time", { ascending: false });

    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "bad request" },
      { status: 400 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const {
      client_id,
      session_type,
      category,
      start_time,
      end_time,
      status,
      notes,
    } = (await req.json()) as {
      client_id?: string;
      session_type: string;
      category?: string;
      start_time: string;
      end_time: string;
      status?: string;
      notes?: string;
    };

    const supabase = sb();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const { data, error } = await supabase
      .from("bookings")
      .insert({
        user_id: user.id,
        client_id: client_id || null,
        session_type: session_type || "General Meeting",
        category: category || null,
        start_time,
        end_time,
        status: status || "pending",
        notes: notes || null,
      })
      .select(
        `
        *,
        clients!inner(id, name, email, phone)
      `
      )
      .single();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "bad request" },
      { status: 400 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const {
      id,
      client_id,
      session_type,
      category,
      start_time,
      end_time,
      status,
      notes,
    } = (await req.json()) as {
      id: string;
      client_id?: string;
      session_type?: string;
      category?: string;
      start_time: string;
      end_time: string;
      status: string;
      notes?: string;
    };

    const supabase = sb();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const { data, error } = await supabase
      .from("bookings")
      .update({
        client_id: client_id || null,
        session_type: session_type || "General Meeting",
        category: category || null,
        start_time,
        end_time,
        status,
        notes: notes || null,
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select(
        `
        *,
        clients!inner(id, name, email, phone)
      `
      )
      .single();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "bad request" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Booking ID required" },
        { status: 400 }
      );
    }

    const supabase = sb();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "bad request" },
      { status: 400 }
    );
  }
}
