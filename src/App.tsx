import { useState, useMemo } from 'react';
import { useNavigate, Route, Routes } from 'react-router';
import { ApolloProvider } from '@apollo/client';
import 'i18n/config';
import 'assets/fonts/fonts.css';
import gqlClient from 'config/apolloclient';
import { SideDrawerContext } from 'context/session';
import ErrorHandler from 'containers/ErrorHandler/ErrorHandler';
import { getAuthSession } from 'services/AuthService';
import { UnauthenticatedRoute } from 'routes/UnauthenticatedRoute/UnauthenticatedRoute';
import { AuthenticatedRoute } from 'routes/AuthenticatedRoute/AuthenticatedRoute';
import { Logout } from 'containers/Auth/Logout/Logout';

const App = () => {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(true);

  const isAuthenticated = !!getAuthSession('access_token');

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
      <ErrorHandler />
      <SideDrawerContext.Provider value={sideDrawerValues}>{routes}</SideDrawerContext.Provider>
    </ApolloProvider>
  );
};

export default App;
