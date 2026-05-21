import Appsignal from '@appsignal/javascript';
import * as BreadcrumbsNetwork from '@appsignal/plugin-breadcrumbs-network';
import * as PathDecorator from '@appsignal/plugin-path-decorator';
import * as WindowEvents from '@appsignal/plugin-window-events';
import { ErrorBoundary } from '@appsignal/react';
import { CssBaseline } from '@mui/material';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import { PostHogErrorBoundary, PostHogProvider } from '@posthog/react';
import posthog from 'posthog-js';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import './sentry.config';

import { NEW_DOMAIN, OLD_DOMAIN } from 'common/constants';
import packageInfo from '../package.json';
import App from './App';
import { APPSIGNAL_API_KEY, POSTHOG_HOST, POSTHOG_PROJECT_TOKEN } from './config';
import theme from './config/theme';
import './index.css';

if (POSTHOG_PROJECT_TOKEN) {
  posthog.init(POSTHOG_PROJECT_TOKEN, {
    api_host: POSTHOG_HOST,
    defaults: '2026-01-30',
    capture_performance: {
      web_vitals: true,
    },
  });
}

if (location.hostname.endsWith(OLD_DOMAIN)) {
  location.hostname = location.hostname.replace(OLD_DOMAIN, NEW_DOMAIN) + location.pathname;
} else {
  let appComponent = <App />;
  if (APPSIGNAL_API_KEY) {
    const appsignal = new Appsignal({
      key: APPSIGNAL_API_KEY,
      revision: packageInfo.version,
    });
    appsignal.use(BreadcrumbsNetwork.plugin({ xhrEnabled: true }));
    appsignal.use(PathDecorator.plugin());
    appsignal.use(WindowEvents.plugin({ onunhandledrejection: true, onerror: true }));

    appComponent = (
      <ErrorBoundary instance={appsignal}>
        <App />
      </ErrorBoundary>
    );
  }

  const root = createRoot(document.getElementById('root')!);

  root.render(
    <PostHogProvider client={posthog}>
      <PostHogErrorBoundary>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>{appComponent}</BrowserRouter>
          </ThemeProvider>
        </StyledEngineProvider>
      </PostHogErrorBoundary>
    </PostHogProvider>
  );
}
