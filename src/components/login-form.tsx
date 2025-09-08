"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { toast } from "sonner";
import { Github } from "lucide-react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function signInWithGitHub() {
    try {
      setIsLoading(true);
      const supabase = supabaseBrowser();

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/admin`,
        },
      });

      if (error) {
        console.error("GitHub auth error:", error);
        toast.error("Failed to sign in with GitHub", {
          description: error.message,
        });
        return;
      }

      if (!data.url) {
        toast.error("Failed to get authorization URL");
        return;
      }

      // Show loading toast before redirect
      toast.loading("Redirecting to GitHub...", {
        duration: 5000,
      });

      // Redirect to GitHub
      router.push(data.url);
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("Something went wrong", {
        description: "Please try again or contact support.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6 w-full max-w-sm mx-auto">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome to Modfram
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in to access your admin dashboard
        </p>
      </div>

      <Button
        type="button"
        className="w-full"
        disabled={isLoading}
        onClick={signInWithGitHub}
        variant="outline"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-b-2 border-current" />
            Connecting...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Github className="w-4 h-4" />
            Sign in with GitHub
          </span>
        )}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Secure authentication
          </span>
        </div>
      </div>

      <p className="px-8 text-center text-sm text-muted-foreground">
        By continuing, you agree to our{" "}
        <a
          href="/terms"
          className="underline underline-offset-4 hover:text-primary"
        >
          Terms of Service
        </a>{" "}
        and{" "}
        <a
          href="/privacy"
          className="underline underline-offset-4 hover:text-primary"
        >
          Privacy Policy
        </a>
      </p>
    </div>
  );
}
