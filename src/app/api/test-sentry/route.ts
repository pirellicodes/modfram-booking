import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

export async function GET(request: NextRequest) {
  try {
    console.log("Testing Sentry logger from API route...");

    // Test the Sentry.logger that's used throughout your codebase
    Sentry.logger.info('User triggered test log', { log_source: 'sentry_test' });

    // Also test standard Sentry methods
    Sentry.captureMessage('API test message', 'info');

    return NextResponse.json({
      success: true,
      message: "Sentry test completed",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Sentry test failed:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
