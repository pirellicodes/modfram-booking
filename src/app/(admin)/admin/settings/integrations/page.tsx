"use client";

import {
  AlertCircle,
  Calendar,
  CheckCircle,
  ExternalLink,
  Settings,
  Trash2,
  Zap,
} from "lucide-react";
import { useEffect,useState } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabaseBrowser } from "@/lib/supabase-browser";

interface Integration {
  id: string;
  integration_type: string;
  created_at: string;
  token_expires_at?: string;
  integration_data?: Record<string, unknown>;
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  useEffect(() => {
    fetchIntegrations();

    // Check for URL parameters (success/error from OAuth)
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get("success");
    const error = urlParams.get("error");

    if (success === "google_connected") {
      toast.success("Google Calendar connected successfully!");
      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname);
    }

    if (error) {
      const errorMessages: Record<string, string> = {
        no_code: "Authorization was cancelled or failed",
        auth_required: "Please log in to connect integrations",
        storage_failed: "Failed to save integration settings",
        callback_failed: "OAuth callback failed",
        oauth_not_configured:
          "Google OAuth is not configured. Please contact your administrator.",
        oauth_failed: "OAuth connection failed. Please try again.",
      };

      toast.error(errorMessages[error] || "Integration failed");
      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const fetchIntegrations = async () => {
    try {
      const supabase = supabaseBrowser();
      const { data, error } = await supabase
        .from("user_integrations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setIntegrations(data || []);
    } catch (error) {
      console.error("Error fetching integrations:", error);
      toast.error("Failed to load integrations");
    } finally {
      setLoading(false);
    }
  };

  const connectGoogleCalendar = () => {
    window.location.href = "/api/google/oauth/start";
  };

  const disconnectIntegration = async (integrationId: string, type: string) => {
    setDisconnecting(integrationId);

    try {
      const supabase = supabaseBrowser();
      const { error } = await supabase
        .from("user_integrations")
        .delete()
        .eq("id", integrationId);

      if (error) throw error;

      setIntegrations(integrations.filter((i) => i.id !== integrationId));
      toast.success(`${type} disconnected successfully`);
    } catch (error) {
      console.error("Error disconnecting integration:", error);
      toast.error("Failed to disconnect integration");
    } finally {
      setDisconnecting(null);
    }
  };

  const isTokenExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const getGoogleIntegration = () => {
    return integrations.find((i) => i.integration_type === "google_calendar");
  };

  const googleIntegration = getGoogleIntegration();

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Integrations</h1>
          <p className="text-muted-foreground mt-1">
            Connect your favorite tools and services
          </p>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-muted-foreground mt-1">
          Connect your favorite tools and services to enhance your booking
          workflow
        </p>
      </div>

      {/* Calendar Integrations */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Calendar Integration
        </h2>

        {/* Google Calendar */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Google Calendar</CardTitle>
                  <CardDescription>
                    Automatically create calendar events for confirmed bookings
                  </CardDescription>
                </div>
              </div>

              {googleIntegration ? (
                <div className="flex items-center gap-2">
                  {isTokenExpired(googleIntegration.token_expires_at) ? (
                    <Badge variant="destructive" className="gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Expired
                    </Badge>
                  ) : (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Connected
                    </Badge>
                  )}
                </div>
              ) : (
                <Badge variant="secondary">Not Connected</Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {googleIntegration ? (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p>
                    Connected on{" "}
                    {new Date(
                      googleIntegration.created_at
                    ).toLocaleDateString()}
                  </p>
                  {googleIntegration.token_expires_at && (
                    <p>
                      Token expires:{" "}
                      {new Date(
                        googleIntegration.token_expires_at
                      ).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {isTokenExpired(googleIntegration.token_expires_at) && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Your Google Calendar connection has expired. Please
                      reconnect to continue syncing events.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2">
                  {isTokenExpired(googleIntegration.token_expires_at) ? (
                    <Button onClick={connectGoogleCalendar}>
                      Reconnect Google Calendar
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={connectGoogleCalendar}>
                      <Settings className="h-4 w-4 mr-2" />
                      Reconfigure
                    </Button>
                  )}

                  <Button
                    variant="destructive"
                    onClick={() =>
                      disconnectIntegration(
                        googleIntegration.id,
                        "Google Calendar"
                      )
                    }
                    disabled={disconnecting === googleIntegration.id}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {disconnecting === googleIntegration.id
                      ? "Disconnecting..."
                      : "Disconnect"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p>
                    Connect Google Calendar to automatically create calendar
                    events when bookings are confirmed.
                  </p>
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li>Auto-create events for confirmed bookings</li>
                    <li>Include booking details and participant information</li>
                    <li>Generate Meet links for virtual meetings</li>
                    <li>Sync cancellations and updates</li>
                  </ul>
                </div>

                <Button onClick={connectGoogleCalendar}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Connect Google Calendar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Other Integrations */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Other Integrations
        </h2>

        {/* Zapier Integration */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Zap className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Zapier</CardTitle>
                  <CardDescription>
                    Connect to 3000+ apps via Zapier automation
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline">Beta</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>Automate your booking workflow with Zapier integrations.</p>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Trigger actions when bookings are created or updated</li>
                <li>Send data to CRM, email tools, and databases</li>
                <li>Create custom automation workflows</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Button variant="outline" disabled>
                <ExternalLink className="h-4 w-4 mr-2" />
                Configure Zapier (Beta)
              </Button>
              <p className="text-xs text-muted-foreground">
                Zapier integration is currently in beta. Contact support for
                early access.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Webhooks Integration */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Settings className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Webhooks</CardTitle>
                  <CardDescription>
                    Send booking data to your custom endpoints
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline">Available</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>Send real-time booking events to your custom endpoints.</p>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Booking created, updated, cancelled events</li>
                <li>Payment status changes</li>
                <li>Client registration events</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Button variant="outline" disabled>
                <Settings className="h-4 w-4 mr-2" />
                Manage Webhooks
              </Button>
              <p className="text-xs text-muted-foreground">
                Contact support to enable webhook endpoints for your account.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
