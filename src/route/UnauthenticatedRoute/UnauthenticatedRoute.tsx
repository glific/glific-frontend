import React from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';
import Login from '../../containers/Auth/Login/Login';
import Registration from '../../containers/Auth/Registration/Registration';
import ConfirmOTP from '../../containers/Auth/ConfirmOTP/ConfirmOTP';
import { ResetPasswordPhone } from '../../containers/Auth/ResetPassword/ResetPasswordPhone';
import { ResetPasswordConfirmOTP } from '../../containers/Auth/ResetPassword/ResetPasswordConfirmOTP';

export const UnauthenticatedRoute: React.SFC = () => {
  return (
    <Switch>
      <Route path="/login" exact component={Login} />
      <Route path="/registration" exact component={Registration} />
      <Route path="/confirmotp" exact component={ConfirmOTP} />
      <Route path="/resetpassword-phone" exact component={ResetPasswordPhone} />
      <Route path="/resetpassword-confirmotp" exact component={ResetPasswordConfirmOTP} />
      <Route path="/" render={() => <Redirect to="/login" />} />
    </Switch>
  );
};
