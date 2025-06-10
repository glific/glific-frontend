import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Route, Routes } from 'react-router';

import { ApolloProvider } from '@apollo/client';
import 'i18n/config';

import 'assets/fonts/fonts.css';
import gqlClient from 'config/apolloclient';
import { SideDrawerContext } from 'context/session';
import ErrorHandler from 'containers/ErrorHandler/ErrorHandler';
import { getAuthSession, checkAuthStatusService } from 'services/AuthService';
import { UnauthenticatedRoute } from 'routes/UnauthenticatedRoute/UnauthenticatedRoute';
import { AuthenticatedRoute } from 'routes/AuthenticatedRoute/AuthenticatedRoute';
import { Logout } from 'containers/Auth/Logout/Logout';
import { checkSessionValidity } from 'common/utils';

const App = () => {
  const navigate = useNavigate();
  // by default, do not assign any value to assume login or logout
  // let's checkAuthStatusService allocate it on useEffect
  const [drawerOpen, setDrawerOpen] = useState(true);
  const isAuthenticated = !!getAuthSession('accessToken');

  useEffect(() => {
    const checkAuth = async () => {
      const isAccessTokenPresent = getAuthSession('accessToken') !== null;
      const isTokenAlive = checkAuthStatusService();

      // Only renew token if present but expired
      if (isAccessTokenPresent && !isTokenAlive) {
        const sessionValid = await checkSessionValidity();
        if (!sessionValid) {
          navigate('/logout/user');
        }
      }
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

  let routes;

  if (isAuthenticated) {
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

  return (
    <ApolloProvider client={gqlClient(navigate)}>
      <ErrorHandler />
      <SideDrawerContext.Provider value={sideDrawerValues}>{routes}</SideDrawerContext.Provider>
    </ApolloProvider>
  );
};

export default App;
