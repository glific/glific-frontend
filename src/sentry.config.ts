import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE || 'development',
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  tracesSampleRate: 1,
  attachStacktrace: true,

  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.browserSessionIntegration(),
    Sentry.httpClientIntegration(),
    Sentry.captureConsoleIntegration(),
  ],
});
