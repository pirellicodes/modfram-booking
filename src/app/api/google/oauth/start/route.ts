import { NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/google";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET() {
  try {
    // Check if required environment variables are set
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_URL}/admin/settings/integrations?error=oauth_not_configured`
      );
    }

    // Check if user is authenticated
    const supabase = supabaseServer();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_URL}/admin/settings/integrations?error=auth_required`
      );
    }

    // Generate Google OAuth URL
    const authUrl = getAuthUrl();

    // Store state to verify callback (optional but recommended)
    const state = Buffer.from(
      JSON.stringify({
        userId: user.id,
        timestamp: Date.now(),
      })
    ).toString("base64");

    const urlWithState = `${authUrl}&state=${state}`;

    return NextResponse.redirect(urlWithState);
  } catch (error) {
    console.error("Google OAuth start error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_URL}/admin/settings/integrations?error=oauth_failed`
    );
  }
}
