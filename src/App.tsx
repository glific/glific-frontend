import React, { useState, useEffect } from 'react';
import { ApolloProvider } from '@apollo/client';
import './assets/fonts/fonts.css';
import gqlClient from './config/apolloclient';
import { SessionContext } from './context/session';
import { ErrorHandler } from './containers/ErrorHandler/ErrorHandler';
import { checkAuthStatusService } from './services/AuthService';
import { UnauthenticatedRoute } from './route/UnauthenticatedRoute/UnauthenticatedRoute';
import { AuthenticatedRoute } from './route/AuthenticatedRoute/AuthenticatedRoute';

const App = () => {
  const [authenticated, setAuthenticated] = useState(true);

  useEffect(() => {
    setAuthenticated(checkAuthStatusService());
  }, []);

  const values = {
    authenticated,
    setAuthenticated: (value: any) => {
      setAuthenticated(value);
    },
  };

  let routes;

  if (authenticated) {
    routes = <AuthenticatedRoute />;
  } else {
    routes = <UnauthenticatedRoute />;
  }

  return (
    <SessionContext.Provider value={values}>
      <ApolloProvider client={gqlClient()}>
        <ErrorHandler />
        {routes}
      </ApolloProvider>
    </SessionContext.Provider>
  );
};

export default App;
