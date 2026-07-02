import { useState } from 'react';
import { Navigate, useLocation } from 'react-router';
import axios from 'axios';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';

import { RESET_PASSWORD } from 'config';
import { Input } from 'components/UI/Form/Input/Input';
import { PhoneInput } from 'components/UI/Form/PhoneInput/PhoneInput';
import { yupPasswordValidation } from 'common/constants';
import { sendOTP } from 'services/AuthService';
import { Auth } from '../Auth';

export const ResetPasswordConfirmOTP = () => {
  const [redirect, setRedirect] = useState(false);
  const [authError, setAuthError] = useState('');
  const { t } = useTranslation();
  const location = useLocation();
  // Read the state synchronously so the phone number is prepopulated on the very first render
  // (Formik captures initialValues once, so an async useEffect would leave the field blank).
  const locationState = (location.state as any) || {};
  const [phoneNumber] = useState<string>(locationState.phoneNumber ?? '');
  const [otpInfoMessage] = useState<string>(locationState.otpInfoMessage ?? '');

  // Let's not allow direct navigation to this page
  if (location && location.state === undefined) {
    return <Navigate to="/resetpassword-phone" />;
  }

  if (redirect) {
    return <Navigate to="/login" />;
  }

  // Resend against the phone currently in the form (the user may have edited the prepopulated
  // one), and surface a retry hint if the request fails, e.g. it was requested too soon.
  const handleResend = (values?: { phoneNumber?: string }) => {
    const phone = values?.phoneNumber || phoneNumber;
    sendOTP(phone)
      .then(() => setAuthError(''))
      .catch(() => setAuthError('Could not resend the OTP. Please try again in 30 seconds.'));
  };

  const formFields = [
    {
      component: PhoneInput,
      name: 'phoneNumber',
      type: 'phone',
      placeholder: t('Phone number'),
      helperText: t('Please enter a phone number.'),
    },
    {
      component: Input,
      type: 'otp',
      name: 'OTP',
      placeholder: 'OTP',
      helperText: t('Please confirm the OTP received at your WhatsApp number.'),
      endAdornmentCallback: handleResend,
    },
    {
      component: Input,
      name: 'password',
      type: 'password',
      placeholder: t('New Password'),
    },
  ];

  const FormSchema = Yup.object().shape({
    OTP: Yup.string().required(t('Input required')),
    password: yupPasswordValidation(t),
  });

  const initialFormValues = {
    phoneNumber,
    OTP: '',
    password: '',
  };

  const onSubmitOTP = (values: any) => {
    axios
      .post(RESET_PASSWORD, {
        user: {
          phone: values.phoneNumber,
          password: values.password,
          otp: values.OTP,
        },
      })
      .then(() => {
        setRedirect(true);
      })
      .catch((error) => {
        setAuthError(t('We are unable to update your password, please enter the correct OTP.'));
      });
  };

  return (
    <Auth
      pageTitle={t('Reset your password')}
      buttonText={t('Save')}
      alternateLink="login"
      alternateText={t('Go to login')}
      mode="secondreset"
      formFields={formFields}
      infoMessage={otpInfoMessage}
      validationSchema={FormSchema}
      saveHandler={onSubmitOTP}
      initialFormValues={initialFormValues}
      errorMessage={authError}
    />
  );
};

export default ResetPasswordConfirmOTP;
