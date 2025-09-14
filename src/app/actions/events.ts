"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function sb() {
  const store = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return store.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            store.set(name, value, options)
          );
        },
      },
    }
  );
}

export type NewEvent = {
  title: string;
  start: string; // ISO
  end: string; // ISO
  notes?: string;
};

export async function createEvent(input: NewEvent) {
  const supabase = await sb();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("unauthenticated");

  const { data, error } = await supabase
    .from("events")
    .insert({
      user_id: user.id,
      title: input.title,
      start: input.start,
      end: input.end,
      notes: input.notes ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export type UpsertAvailability = {
  weekday: number; // 0-6
  slots: { start: string; end: string }[];
};

export async function upsertAvailability(params: UpsertAvailability) {
  const supabase = await sb();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("unauthenticated");

  const { data, error } = await supabase
    .from("availability")
    .upsert(
      { user_id: user.id, weekday: params.weekday, slots: params.slots },
      { onConflict: "user_id,weekday" }
    )
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}
