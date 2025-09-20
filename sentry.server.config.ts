import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://792fa0dc8b17daa502eb92c221e7ff9c@o4510038558900224.ingest.us.sentry.io/4510038564732928",

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  integrations: [
    // send console.log, console.warn, and console.error calls as logs to Sentry
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  ],

  // Enable logs to be sent to Sentry
  enableLogs: true,
});
