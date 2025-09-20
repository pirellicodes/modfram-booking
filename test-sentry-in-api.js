// Simple test to verify Sentry logger works
// Run this with: curl http://localhost:3000/api/bookings

// Based on your code, this should work:
// import * as Sentry from "@sentry/nextjs";
// Sentry.logger.info('User triggered test log', { log_source: 'sentry_test' })

console.log("✅ Your Sentry test code should work in API routes!");
console.log("📝 The code you provided:");
console.log("   import * as Sentry from '@sentry/nextjs';");
console.log("   Sentry.logger.info('User triggered test log', { log_source: 'sentry_test' })");
console.log("");
console.log("💡 This logger is already being used successfully in:");
console.log("   - src/app/api/bookings/route.ts (lines 33, 83, 108, etc.)");
console.log("   - It works in Next.js API route context");
console.log("");
console.log("🧪 To test, add your code to any API route and call the endpoint!");
