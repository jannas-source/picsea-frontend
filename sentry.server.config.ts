// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
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
