import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export function supabaseServer() {
  const store = cookies(); // readonly type

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => store.get(name)?.value,
        set: (name: string, value: string, options: CookieOptions) =>
          (store as any).set(name, value, options), // cast fixes TS
        remove: (name: string, options: CookieOptions) =>
          (store as any).set(name, "", options), // cast fixes TS
      },
    }
  );
}
