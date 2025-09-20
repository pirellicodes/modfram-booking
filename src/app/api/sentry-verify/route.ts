import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Executing Sentry verification test...");

    // Execute the exact code from Sentry's verification step
    Sentry.logger.info('User triggered test log', { log_source: 'sentry_test' });

    console.log("✅ Sentry test log sent successfully!");

    return NextResponse.json({
      success: true,
      message: "Sentry verification test completed",
      timestamp: new Date().toISOString(),
      testCode: "Sentry.logger.info('User triggered test log', { log_source: 'sentry_test' })"
    });
  } catch (error) {
    console.error("❌ Sentry verification test failed:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
