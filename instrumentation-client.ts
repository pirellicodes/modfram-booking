import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://792fa0dc8b17daa502eb92c221e7ff9c@o4510038558900224.ingest.us.sentry.io/4510038564732928",

  // Adds request headers and IP for users, for more info visit:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,

  integrations: [
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the environment variable `SENTRY_RELEASE`, so
  // that it will also get attached to your source maps
});

// This export will instrument router navigations, and is only relevant if you enable tracing.
// `captureRouterTransitionStart` is available from SDK version 9.12.0 onwards
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
