// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://acf4304fae4f21a0d13e959704c91848@o4510891646582784.ingest.us.sentry.io/4510891646779392",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Disable log capture to prevent sensitive data leaking to Sentry
  enableLogs: false,

  // Disable PII collection — do not send user emails, IPs, etc. to Sentry
  sendDefaultPii: false,
});
