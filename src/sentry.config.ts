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

// Has a usable stack. The browser SDK sets in_app:true on every frame, so this
// only weeds out frameless cross-origin "Script error." events, not app vs lib.
const hasInAppFrame = (event: Sentry.ErrorEvent): boolean =>
  (event.exception?.values ?? []).some((v) => (v.stacktrace?.frames ?? []).some((f) => f.in_app === true));

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment,
  debug: false,

  tracesSampleRate: isProduction ? 0.1 : 1,
  attachStacktrace: true,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,

  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.browserSessionIntegration(),
    Sentry.httpClientIntegration(),
  ],

  ignoreErrors: KNOWN_BENIGN_EXCEPTIONS,
  denyUrls: DENY_URLS,

  beforeSend(event) {
    if (event.level && !['error', 'fatal'].includes(event.level)) return null;
    if (event.exception && !hasInAppFrame(event)) return null;
    return event;
  },
});
