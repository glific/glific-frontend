import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@material-ui/core';
import Appsignal from '@appsignal/javascript';
import { ErrorBoundary } from '@appsignal/react';
import ReactErrorBoundary from 'components/errorboundary/ErrorBoundary';
import * as WindowEvents from '@appsignal/plugin-window-events';
import * as BreadcrumbsNetwork from '@appsignal/plugin-breadcrumbs-network';
import * as PathDecorator from '@appsignal/plugin-path-decorator';

import theme from './config/theme';
import { APPSIGNAL_API_KEY } from './config';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { version } from '../package.json';

let appComponent = <App />;
if (APPSIGNAL_API_KEY) {
  const appsignal = new Appsignal({
    key: APPSIGNAL_API_KEY,
    revision: version,
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

ReactDOM.render(
  <React.StrictMode>
    <ReactErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>{appComponent}</BrowserRouter>
      </ThemeProvider>
    </ReactErrorBoundary>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
