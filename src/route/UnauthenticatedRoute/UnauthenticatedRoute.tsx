import React, { lazy, Suspense } from 'react';
import { Route, Redirect, Switch, useLocation } from 'react-router-dom';

import Loading from 'components/UI/Layout/Loading/Loading';

export const UnauthenticatedRoute = () => {
  const Login = lazy(() => import('containers/Auth/Login/Login'));
  const Registration = lazy(() => import('containers/Auth/Registration/Registration'));
  const ConfirmOTP = lazy(() => import('containers/Auth/ConfirmOTP/ConfirmOTP'));
  const ResetPasswordPhone = lazy(() => import('containers/Auth/ResetPassword/ResetPasswordPhone'));
  const ResetPasswordConfirmOTP = lazy(
    () => import('containers/Auth/ResetPassword/ResetPasswordConfirmOTP')
  );

  const OrganizationRegistration = lazy(() => import('containers/Organization/RouteSetupSteps'));

  const location = useLocation();

  return (
    <Suspense fallback={<Loading />}>
      <Switch>
        <Route path="/login" exact component={Login} />
        <Route path="/registration" exact component={Registration} />
        <Route path="/confirmotp" exact component={ConfirmOTP} />
        <Route path="/resetpassword-phone" exact component={ResetPasswordPhone} />
        <Route path="/resetpassword-confirmotp" exact component={ResetPasswordConfirmOTP} />
        <Route path="/organization-registration" exact component={OrganizationRegistration} />
        <Route
          path="/"
          render={() => <Redirect to={{ pathname: '/logout/user', state: location.pathname }} />}
        />
      </Switch>
    </Suspense>
  );
};

export default UnauthenticatedRoute;
