import * as Sentry from "@sentry/nextjs";

console.log("Testing Sentry logging...");

// Test different Sentry logging methods
console.log("Sending console.log - should be captured by Sentry");

console.warn("Sending console.warn - should be captured by Sentry", {
  log_source: "sentry_test",
});

console.error("Sending console.error - should be captured by Sentry", {
  log_source: "sentry_test",
});

// Test Sentry addBreadcrumb
Sentry.addBreadcrumb({
  message: "User triggered test log",
  level: "info",
  data: { log_source: "sentry_test" },
});

// Test Sentry captureMessage
Sentry.captureMessage("User triggered test log", "info");

console.log("All Sentry tests completed!");
