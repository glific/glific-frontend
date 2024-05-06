import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

import { Loading } from 'components/UI/Layout/Loading/Loading';
import { RECAPTCHA_CLIENT_KEY } from 'config';
import { RegistrationHome } from 'containers/Auth/RegistrationForm/Registration/RegistrationHome';

export const UnauthenticatedRoute = () => {
  const location = useLocation();

  const Login = lazy(() => import('containers/Auth/Login/Login'));
  // const Registration = lazy(() => import('containers/Auth/Registration/Registration'));
  const Registration = lazy(() => import('containers/Auth/RegistrationForm/ResgistrationForm'));
  const ConfirmOTP = lazy(() => import('containers/Auth/ConfirmOTP/ConfirmOTP'));
  const ResetPasswordPhone = lazy(() => import('containers/Auth/ResetPassword/ResetPasswordPhone'));
  const ResetPasswordConfirmOTP = lazy(
    () => import('containers/Auth/ResetPassword/ResetPasswordConfirmOTP')
  );
  const OrganizationRegistration = lazy(() => import('containers/Organization/RouteSetupSteps'));

  return (
    <Suspense fallback={<Loading />}>
      <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_CLIENT_KEY}>
        <Routes>
          <Route index element={<Navigate to="/logout/user" replace state={location.pathname} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registration" element={<RegistrationHome />} />
          <Route path="/registration/setup" element={<Registration />} />
          <Route path="/confirmotp" element={<ConfirmOTP />} />
          <Route path="/resetpassword-phone" element={<ResetPasswordPhone />} />
          <Route path="/resetpassword-confirmotp" element={<ResetPasswordConfirmOTP />} />
          <Route path="/organization-registration" element={<OrganizationRegistration />} />
          <Route
            path="/*"
            element={<Navigate to="/logout/user" replace state={location.pathname} />}
          />
        </Routes>
      </GoogleReCaptchaProvider>
    </Suspense>
  );
};

export default UnauthenticatedRoute;
