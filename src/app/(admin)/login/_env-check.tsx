"use client";

export default function EnvCheck() {
  console.log("INLINE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log("INLINE_ANON", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0,10));
  return null;
}
