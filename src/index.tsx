import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@material-ui/core';
import { ApolloProvider } from '@apollo/client';
import * as Sentry from '@sentry/browser';

import theme from './config/theme';
import gqlClient from './config/apolloclient';
import { SENTRY_DSN } from './config/';

import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

// setup data source for sentry
if (SENTRY_DSN) {
  Sentry.init({ dsn: SENTRY_DSN });
}

ReactDOM.render(
  <React.StrictMode>
    <CssBaseline />
    <ApolloProvider client={gqlClient}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </ApolloProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
