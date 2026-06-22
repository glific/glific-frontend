import { CssBaseline } from '@mui/material';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import { PostHogProvider } from '@posthog/react';
import posthog from 'posthog-js';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import './sentry.config';

import { NEW_DOMAIN, OLD_DOMAIN } from 'common/constants';
import App from './App';
import { POSTHOG_HOST, POSTHOG_PROJECT_TOKEN } from './config';
import theme from './config/theme';
import './index.css';

function redirectOldDomain(): void {
  location.hostname = location.hostname.replace(OLD_DOMAIN, NEW_DOMAIN) + location.pathname;
}

function initPostHog(): boolean {
  if (!POSTHOG_PROJECT_TOKEN) {
    return false;
  }

  try {
    posthog.init(POSTHOG_PROJECT_TOKEN, {
      api_host: POSTHOG_HOST,
      defaults: '2026-01-30',
      capture_performance: {
        web_vitals: true,
      },
      // Session Replay privacy posture. Recording is OFF until enabled in the PostHog
      // project settings, and — critically — it must be scoped there to the
      // assistant/prompt-generator pages **by URL** (not by feature flag, which records
      // the whole session). That URL scope is what keeps chat (contact numbers) and login
      // (credentials) out of recordings entirely. Within that scope the prompt-generator
      // inputs aren't sensitive, so we leave inputs/text visible — but always mask
      // password fields as a safety net for credentials.
      session_recording: {
        maskAllInputs: false,
        maskInputOptions: { password: true },
      },
    });
    return true;
  } catch {
    return false;
  }
}

function AppTree() {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

function mountApp(): void {
  const root = createRoot(document.getElementById('root')!);
  const posthogEnabled = initPostHog();
  const appTree = <AppTree />;

  root.render(posthogEnabled ? <PostHogProvider client={posthog}>{appTree}</PostHogProvider> : appTree);
}

if (location.hostname.endsWith(OLD_DOMAIN)) {
  redirectOldDomain();
} else {
  mountApp();
}
