import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import Appsignal from '@appsignal/javascript';
import { ErrorBoundary } from '@appsignal/react';
import * as WindowEvents from '@appsignal/plugin-window-events';
import * as BreadcrumbsNetwork from '@appsignal/plugin-breadcrumbs-network';
import * as PathDecorator from '@appsignal/plugin-path-decorator';

import theme from './config/theme';
import { APPSIGNAL_API_KEY } from './config';
import './index.css';
import App from './App';
import packageInfo from '../package.json';

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
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <BrowserRouter>{appComponent}</BrowserRouter>
  </ThemeProvider>
);
