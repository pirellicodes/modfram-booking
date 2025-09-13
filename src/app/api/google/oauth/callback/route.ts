import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/lib/google";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // Handle OAuth errors
    if (error) {
      console.error("Google OAuth error:", error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_URL}/admin/settings/integrations?error=${error}`
      );
    }

    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_URL}/admin/settings/integrations?error=no_code`
      );
    }

    // Verify state (optional)
    let userId = null;
    if (state) {
      try {
        const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
        userId = stateData.userId;
      } catch (err) {
        console.error("Invalid state parameter:", err);
      }
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);

    if (!tokens.access_token) {
      throw new Error("No access token received");
    }

    // Get user from Supabase
    const supabase = supabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_URL}/admin/settings/integrations?error=auth_required`
      );
    }

    // Store tokens in user_integrations table
    const integrationData = {
      user_id: user.id,
      integration_type: 'google_calendar',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expires_at: tokens.expiry_date
        ? new Date(tokens.expiry_date).toISOString()
        : null,
      integration_data: {
        scope: tokens.scope,
        token_type: tokens.token_type,
      },
    };

    // Upsert the integration (update if exists, insert if new)
    const { error: upsertError } = await supabase
      .from("user_integrations")
      .upsert(integrationData, {
        onConflict: "user_id,integration_type",
      });

    if (upsertError) {
      console.error("Error storing Google Calendar integration:", upsertError);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_URL}/admin/settings/integrations?error=storage_failed`
      );
    }

    // Redirect to settings page with success
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_URL}/admin/settings/integrations?success=google_connected`
    );

  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_URL}/admin/settings/integrations?error=callback_failed`
    );
  }
}
