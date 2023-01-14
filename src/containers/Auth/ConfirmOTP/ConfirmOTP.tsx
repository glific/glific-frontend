import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Navigate, useLocation } from 'react-router-dom';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';

import { VITE_GLIFIC_REGISTRATION_API } from 'config';
import { Input } from 'components/UI/Form/Input/Input';
// eslint-disable-next-line no-unused-vars
import { sendOTP } from 'services/AuthService';
import setLogs from 'config/logs';
import { Auth } from '../Auth';

// let's define registration success message
const successMessage = (
  <div>
    Your account is registered successfully. Please contact your organisation admin for the
    approval. Click&nbsp;<a href="/login">here</a>&nbsp;for login.
  </div>
);

export const ConfirmOTP = () => {
  const [OTP, setOTP] = useState('');
  const [authSuccess, setAuthSuccess] = useState<any | string>('');
  const [authError, setAuthError] = useState('');
  const { t } = useTranslation();
  const location = useLocation();
  const [userObject, setUserObject] = useState({ name: '', phone: '', password: '' });

  useEffect(() => {
    const state = location.state as any;
    if (state) {
      setUserObject({ name: state.name, phone: state.phoneNumber, password: state.password });
    }
  }, [location]);

  const handleResend = () => {
    sendOTP(userObject.phone, 'true')
      .then((response) => response)
      .catch(() => {
        setAuthError(t('We are unable to generate an OTP, kindly contact your technical team.'));
      });
  };

  // Let's not allow direct navigation to this page
  if (location && location.state === undefined) {
    return <Navigate to="/registration" />;
  }

  const states = { OTP };
  const setStates = ({ OTPValue }: any) => {
    setOTP(OTPValue);
  };

  const formFields = [
    {
      component: Input,
      type: 'otp',
      name: 'OTP',
      placeholder: 'OTP',
      helperText: t('Please confirm the OTP received at your WhatsApp number.'),
      endAdornmentCallback: handleResend,
    },
  ];

  const FormSchema = Yup.object().shape({
    OTP: Yup.string().required(t('Input required')),
  });

  const initialFormValues = { OTP: '' };

  const onSubmitOTP = (values: any) => {
    axios
      .post(VITE_GLIFIC_REGISTRATION_API, {
        user: {
          name: userObject.name,
          phone: userObject.phone,
          password: userObject.password,
          otp: values.OTP,
        },
      })
      .then(() => {
        setAuthSuccess(successMessage);
      })
      .catch((error) => {
        setAuthError(t('We are unable to register, kindly contact your technical team.'));
        // add log's
        setLogs(
          `onSubmitOTP:${{
            user: {
              name: userObject.name,
              phone: userObject.phone,
              otp: values.OTP,
            },
          }} URL:${VITE_GLIFIC_REGISTRATION_API}`,
          'info'
        );
        setLogs(error, 'error');
      });
  };

  return (
    <Auth
      pageTitle={t('Create your new account')}
      buttonText={t('Continue')}
      mode="confirmotp"
      formFields={formFields}
      setStates={setStates}
      states={states}
      validationSchema={FormSchema}
      saveHandler={onSubmitOTP}
      initialFormValues={initialFormValues}
      errorMessage={authError}
      successMessage={authSuccess}
    />
  );
};

export default ConfirmOTP;
