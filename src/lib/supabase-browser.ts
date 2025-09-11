"use client";

import { createBrowserClient } from "@supabase/ssr";

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables:");
  console.error("URL:", supabaseUrl);
  console.error("ANON KEY:", supabaseAnonKey ? "Present" : "Missing");
  throw new Error("Supabase environment variables are required");
}

// Validate URL format
try {
  const url = new URL(supabaseUrl);
  if (!url.host.endsWith(".supabase.co")) {
    console.error(
      "Invalid Supabase URL format. Expected *.supabase.co but got:",
      url.host
    );
  }
} catch (err) {
  console.error("Invalid Supabase URL format:", supabaseUrl);
  throw new Error("Invalid Supabase URL format");
}

export function supabaseBrowser() {
  try {
    console.log("Creating Supabase client with URL:", supabaseUrl);
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.error("Failed to create Supabase client:", err);
    throw err;
  }
}

export const createClient = supabaseBrowser;
