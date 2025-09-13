import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

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

export async function POST(req: Request) {
  try {
    const { weekday, slots } = (await req.json()) as {
      weekday: number; // 0-6
      slots: { start: string; end: string }[];
    };

    const supabase = sb();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const { data, error } = await supabase
      .from("availability")
      .upsert(
        { user_id: user.id, weekday, slots },
        { onConflict: "user_id,weekday" }
      )
      .select()
      .single();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: (e as Error)?.message ?? "bad request" },
      { status: 400 }
    );
  }
}
