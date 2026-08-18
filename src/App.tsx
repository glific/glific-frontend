import { useState, useMemo, useEffect } from 'react';
import { useNavigate, Route, Routes } from 'react-router';
import { ApolloProvider } from '@apollo/client/react';
import 'i18n/config';
import 'assets/fonts/fonts.css';
import gqlClient from 'config/apolloclient';
import { SideDrawerContext } from 'context/session';
import { PosthogSession } from 'components/PosthogSession/PosthogSession';
import ErrorHandler from 'containers/ErrorHandler/ErrorHandler';
import { getAuthSession, checkAuthStatusService, renewAuthToken } from 'services/AuthService';
import { UnauthenticatedRoute } from 'routes/UnauthenticatedRoute/UnauthenticatedRoute';
import { AuthenticatedRoute } from 'routes/AuthenticatedRoute/AuthenticatedRoute';
import { Logout } from 'containers/Auth/Logout/Logout';

const App = () => {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(true);
  const isAuthenticated = !!getAuthSession('access_token');

  // Proactively renew the token on app boot. Apollo Client 4 skips the whole link chain
  // (including apolloclient.ts's own refreshTokenLink) for queries that are 100% @client fields,
  // e.g. ErrorHandler's useQuery(ERROR_MESSAGE) - so a soon-to-expire token is only caught here
  // (on mount) or in refreshTokenLink itself (on the next server-bound query).
  useEffect(() => {
    if (isAuthenticated && !checkAuthStatusService()) {
      renewAuthToken().catch(() => {
        navigate('/logout/session');
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  routes = (
    <Routes>
      <Route path="/logout/:mode" element={<Logout />} />
      <Route path="*" element={routes} />
    </Routes>
  );

  return (
    <ApolloProvider client={gqlClient(navigate)}>
      <PosthogSession />
      <ErrorHandler />
      <SideDrawerContext.Provider value={sideDrawerValues}>{routes}</SideDrawerContext.Provider>
    </ApolloProvider>
  );
};

export default App;
