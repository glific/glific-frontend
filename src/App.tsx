import React, { useState, useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';

import './assets/fonts/fonts.css';
import gqlClient from './config/apolloclient';
import { SessionContext } from './context/session';
import { ErrorHandler } from './containers/ErrorHandler/ErrorHandler';
import { checkAuthStatusService } from './services/AuthService';
import { UnauthenticatedRoute } from './route/UnauthenticatedRoute/UnauthenticatedRoute';
import { AuthenticatedRoute } from './route/AuthenticatedRoute/AuthenticatedRoute';
import { Logout } from './containers/Auth/Logout/Logout';

const App = () => {
  // by default, do not assign any value to assume login or logout
  // let's checkAuthStatusService allocate it on useEffect
  const [authenticated, setAuthenticated] = useState<any>();

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

  if (authenticated !== undefined)
    if (authenticated) {
      routes = <AuthenticatedRoute />;
    } else {
      routes = <UnauthenticatedRoute />;
    }

  // For logout acion, we don't need to check if the user is logged in or not. Hence, adding it at top level
  routes = (
    <Switch>
      <Route path="/logout" exact component={Logout} />
      {routes}
    </Switch>
  );

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
