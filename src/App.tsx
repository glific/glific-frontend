import { startTransition, useState, useEffect, useMemo } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import 'i18n/config';

import 'assets/fonts/fonts.css';
import gqlClient from 'config/apolloclient';
import { SessionContext, SideDrawerContext } from 'context/session';
import ErrorHandler from 'containers/ErrorHandler/ErrorHandler';
import Loading from 'components/UI/Layout/Loading/Loading';
import {
  getAuthSession,
  checkAuthStatusService,
} from 'services/AuthService';
import { UnauthenticatedRoute } from 'routes/UnauthenticatedRoute/UnauthenticatedRoute';
import { AuthenticatedRoute } from 'routes/AuthenticatedRoute/AuthenticatedRoute';
import { Logout } from 'containers/Auth/Logout/Logout';
import { isGreaterThanLgBreakpoint, checkSessionValidity } from 'common/utils';

const App = () => {
  const navigate = useNavigate();
  // by default, do not assign any value to assume login or logout
  // let's checkAuthStatusService allocate it on useEffect
  const [authenticated, setAuthenticated] = useState<any>();
  const [drawerOpen, setDrawerOpen] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const isAccessTokenPresent = getAuthSession('accessToken') !== null;
      const isTokenAlive = checkAuthStatusService();
      let isSessionAlive = false;
      if (!isAccessTokenPresent) {
        // New user
        isSessionAlive = false;
      } else if (isTokenAlive) {
        // Healthy Session
        isSessionAlive = true;
      } else {
        // Expired Token
        isSessionAlive = await checkSessionValidity();
      }
      startTransition(() => {
        setAuthenticated(isSessionAlive);
      });
    };
    checkAuth();
  }, []);

  const sideDrawerValues = useMemo(
    () => ({
      drawerOpen,
      setDrawerOpen: (value: any) => {
        setDrawerOpen(value);
      },
    }),
    [drawerOpen]
  );

  const values = useMemo(
    () => ({
      authenticated,
      setAuthenticated: (value: any) => {
        setAuthenticated(value);
      },
    }),
    [authenticated]
  );

  let routes;

  if (authenticated !== undefined) {
    if (authenticated) {
      routes = <AuthenticatedRoute />;
    } else {
      routes = <UnauthenticatedRoute />;
    }

    // For logout action, we don't need to check if the user is logged in or not. Hence, adding it at top level
    routes = (
      <Routes>
        <Route path="/logout/:mode" element={<Logout />} />
        <Route path="*" element={routes} />
      </Routes>
    );
  }

  return (
    <SessionContext.Provider value={values}>
      <ApolloProvider client={gqlClient(navigate)}>
        <ErrorHandler />
        <SideDrawerContext.Provider value={sideDraawerValues}>
          {routes ? routes : <Loading />}
        </SideDrawerContext.Provider>
      </ApolloProvider>
    </SessionContext.Provider>
  );
};

export default App;
