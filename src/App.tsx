import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import 'i18n/config';
import { ClearCacheProvider, useClearCacheCtx } from 'react-clear-cache';

import 'assets/fonts/fonts.css';
import gqlClient from 'config/apolloclient';
import { SessionContext, SideDrawerContext } from 'context/session';
import ErrorHandler from 'containers/ErrorHandler/ErrorHandler';
import { checkAuthStatusService, getUserSession } from 'services/AuthService';
import { UnauthenticatedRoute } from 'route/UnauthenticatedRoute/UnauthenticatedRoute';
import { AuthenticatedRoute } from 'route/AuthenticatedRoute/AuthenticatedRoute';
import { Logout } from 'containers/Auth/Logout/Logout';
// import { Loading } from 'components/UI/Layout/Loading/Loading';
import { CLEAR_CACHE_DURATION } from 'common/constants';
import setLogs from 'config/logs';
import Loading from 'components/UI/Layout/Loading/Loading';

const App = () => {
  const { isLatestVersion, emptyCacheStorage } = useClearCacheCtx();
  const navigate = useNavigate();
  // by default, do not assign any value to assume login or logout
  // let's checkAuthStatusService allocate it on useEffect
  const [authenticated, setAuthenticated] = useState<any>();
  const [drawerOpen, setDrawerOpen] = useState(window.innerWidth > 768);

  // if not the latest version empty cache
  if (!isLatestVersion && emptyCacheStorage) {
    setLogs(`Empty cache storage for user id -${getUserSession('id')}`, 'info');
    emptyCacheStorage();
  }

  useEffect(() => {
    setAuthenticated(checkAuthStatusService());
  }, []);

  const sideDraawerValues = useMemo(
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
        <Route path="/" element={routes} />
      </Routes>
    );
  }

  return (
    <SessionContext.Provider value={values}>
      <ApolloProvider client={gqlClient(navigate)}>
        <ErrorHandler />
        <SideDrawerContext.Provider value={sideDraawerValues}>
          <ClearCacheProvider duration={CLEAR_CACHE_DURATION}>
            <Suspense fallback={<Loading />}>{routes}</Suspense>
          </ClearCacheProvider>
        </SideDrawerContext.Provider>
      </ApolloProvider>
    </SessionContext.Provider>
  );
};

export default App;
