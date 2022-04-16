import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@material-ui/core';
import Appsignal from '@appsignal/javascript';
import { ErrorBoundary } from '@appsignal/react';
import * as WindowEvents from '@appsignal/plugin-window-events';
import * as BreadcrumbsNetwork from '@appsignal/plugin-breadcrumbs-network';
import * as PathDecorator from '@appsignal/plugin-path-decorator';

import theme from './config/theme';
import { APPSIGNAL_API_KEY } from './config';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import packageInfo from '../package.json';

console.log('vewrsion', packageInfo.version);
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

const container: any = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>{appComponent}</BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
