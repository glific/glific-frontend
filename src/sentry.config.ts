import * as Sentry from '@sentry/react';

const environment = import.meta.env.VITE_ENV || 'development';
const isProduction = environment === 'production';

const KNOWN_BENIGN_EXCEPTIONS: (string | RegExp)[] = [
  'ResizeObserver loop limit exceeded',
  'ResizeObserver loop completed with undelivered notifications',
  'Script error.',
];

// Errors from browser extensions / injected scripts, matched by frame source URL
// (the browser SDK marks every frame in_app:true, so URL is the reliable signal).
const DENY_URLS: RegExp[] = [
  /extensions\//i,
  /^chrome:\/\//i,
  /^chrome-extension:\/\//i,
  /^moz-extension:\/\//i,
  /^safari-extension:\/\//i,
  /^safari-web-extension:\/\//i,
];

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment,
  debug: false,

  tracesSampleRate: isProduction ? 0.5 : 1,
  attachStacktrace: true,

  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.browserSessionIntegration(),
    Sentry.httpClientIntegration(),
  ],

  ignoreErrors: KNOWN_BENIGN_EXCEPTIONS,
  denyUrls: DENY_URLS,
});
