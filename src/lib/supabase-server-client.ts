import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const supabaseServer = async () => {
  const c = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (k) => c.get(k)?.value,
        set: async () => {},
        remove: async () => {},
      },
    }
  );
};
