import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@material-ui/core';
import Appsignal from '@appsignal/javascript';
import { ErrorBoundary } from '@appsignal/react';
import WindowEvents from `@appsignal/plugin-window-events`;
import BreadcrumbsNetwork from '@appsignal/plugin-breadcrumbs-network';
import PathDecorator from `@appsignal/plugin-path-decorator`;

import theme from './config/theme';
import { APPSIGNAL_API_KEY, APPSINAL_REVISION } from './config';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

let appComponent = <App />;
if (APPSIGNAL_API_KEY) {
  const appsignal = new Appsignal({
    key: APPSIGNAL_API_KEY,
    revision: APPSINAL_REVISION,
  });
  appsignal.use(BreadcrumbsNetwork.plugin());

  appComponent = (
    <ErrorBoundary instance={appsignal}>
      <App />
    </ErrorBoundary>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>{appComponent}</BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
