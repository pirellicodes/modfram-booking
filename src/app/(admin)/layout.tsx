"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { supabaseBrowser } from "@/lib/supabase-browser";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = supabaseBrowser();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error || !user) {
          router.replace("/login");
          return;
        }
      } catch (err) {
        console.error("Error checking auth state:", err);
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        router.replace("/login");
      }
    });

    checkUser();

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase.auth]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="h-screen">{children}</main>
    </div>
  );
}
