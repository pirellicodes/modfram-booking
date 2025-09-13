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

module.exports = nextConfig;
