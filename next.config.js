const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Allow build to complete but show ESLint warnings
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Allow build to complete but show TypeScript warnings
    ignoreBuildErrors: false,
  },
  // Remove deprecated experimental.turbo config
};

// Make sure adding Sentry options is the last code to run before exporting
module.exports = withSentryConfig(nextConfig, {
  org: "pirelli-cx",
  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  // Set to `true` to suppress logs
  silent: !process.env.CI,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,
});
