import React, { useState, useEffect, Suspense } from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import './i18n/config';

import './assets/fonts/fonts.css';
import gqlClient from './config/apolloclient';
import { SessionContext } from './context/session';
import { ErrorHandler } from './containers/ErrorHandler/ErrorHandler';
import { checkAuthStatusService } from './services/AuthService';
import { UnauthenticatedRoute } from './route/UnauthenticatedRoute/UnauthenticatedRoute';
import { AuthenticatedRoute } from './route/AuthenticatedRoute/AuthenticatedRoute';
import { Logout } from './containers/Auth/Logout/Logout';
import { Loading } from './components/UI/Layout/Loading/Loading';
import handleCache from './HandleCache';

const App = () => {
  const history = useHistory();
  // by default, do not assign any value to assume login or logout
  // let's checkAuthStatusService allocate it on useEffect
  const [authenticated, setAuthenticated] = useState<any>();
  const { isLatestVersion } = handleCache();
  console.log(isLatestVersion);

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

  if (authenticated !== undefined) {
    if (authenticated) {
      routes = <AuthenticatedRoute />;
    } else {
      routes = <UnauthenticatedRoute />;
    }

    // For logout action, we don't need to check if the user is logged in or not. Hence, adding it at top level
    routes = (
      <Switch>
        <Route path="/logout/:mode" component={Logout} />
        {routes}
      </Switch>
    );
  }

  return (
    <SessionContext.Provider value={values}>
      <ApolloProvider client={gqlClient(history)}>
        <ErrorHandler />
        <Suspense fallback={Loading}>{routes}</Suspense>
      </ApolloProvider>
    </SessionContext.Provider>
  );
};

export default App;
