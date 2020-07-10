import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useCookies } from 'react-cookie';

export const ProtectedRoute = ({ component: Component, ...rest }: any) => {
  const [cookies] = useCookies(['session']);
  return (
    <Route
      {...rest}
      render={(props) => (cookies.session ? <Component {...props} /> : <Redirect to="/login" />)}
    />
  );
};
