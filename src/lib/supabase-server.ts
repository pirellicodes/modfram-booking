import { type CookieOptions,createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function supabaseServer() {
  const store = await cookies(); // readonly type

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => store.get(name)?.value,
        set: (name: string, value: string, options: CookieOptions) =>
          (
            store as {
              set(name: string, value: string, options: CookieOptions): void;
            }
          ).set(name, value, options),
        remove: (name: string, options: CookieOptions) =>
          (
            store as {
              set(name: string, value: string, options: CookieOptions): void;
            }
          ).set(name, "", options),
      },
    }
  );
}
