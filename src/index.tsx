import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import Appsignal from '@appsignal/javascript';
import { StyledEngineProvider } from '@mui/material/styles';
import { ErrorBoundary } from '@appsignal/react';
import * as WindowEvents from '@appsignal/plugin-window-events';
import * as BreadcrumbsNetwork from '@appsignal/plugin-breadcrumbs-network';
import * as PathDecorator from '@appsignal/plugin-path-decorator';

import theme from './config/theme';
import { APPSIGNAL_API_KEY } from './config';
import './index.css';
import App from './App';
import packageInfo from '../package.json';
import { NEW_DOMAIN, OLD_DOMAIN } from 'common/constants';

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
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>{appComponent}</BrowserRouter>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}
