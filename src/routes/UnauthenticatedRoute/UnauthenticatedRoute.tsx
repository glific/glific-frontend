import React, { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

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

  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route index element={<Navigate to="/logout/user" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/confirmotp" element={<ConfirmOTP />} />
        <Route path="/resetpassword-phone" element={<ResetPasswordPhone />} />
        <Route path="/resetpassword-confirmotp" element={<ResetPasswordConfirmOTP />} />
        <Route path="/organization-registration" element={<OrganizationRegistration />} />
        <Route path="/*" element={<Navigate to="/logout/user" replace />} />
      </Routes>
    </Suspense>
  );
};

export default UnauthenticatedRoute;
