import * as Sentry from '@sentry/react';

const environment = import.meta.env.VITE_ENV || 'development';
const isProduction = environment === 'production';

const KNOWN_BENIGN_EXCEPTIONS: (string | RegExp)[] = [
  'ResizeObserver loop limit exceeded',
  'ResizeObserver loop completed with undelivered notifications',
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

// True if the exception carries at least one resolved stack frame. We check for
// a usable stack rather than `in_app` (which the browser SDK sets to true on
// every frame at capture time, and which Sentry can reclassify server-side) so
// we never risk dropping real errors. Its only job is to weed out frameless
// cross-origin "Script error." events, which carry no actionable signal.
const hasUsableStack = (event: Sentry.ErrorEvent): boolean =>
  (event.exception?.values ?? []).some((v) => (v.stacktrace?.frames ?? []).length > 0);

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

  beforeSend(event) {
    if (event.exception && !hasUsableStack(event)) return null;
    return event;
  },
});
