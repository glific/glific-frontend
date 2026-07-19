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
      opt_in_site_apps: true,
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
