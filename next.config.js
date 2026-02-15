/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removing 'export' to support Sentry tunnelRoute and full Next.js features
  images: {
    unoptimized: true,
    domains: ['productimageserver.com'],
  },
};

const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(nextConfig, {
  org: "7sense",
  project: "javascript-nextjs",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  webpack: {
    automaticVercelMonitors: true,
    treeshake: {
      removeDebugLogging: true,
    },
  },
});
