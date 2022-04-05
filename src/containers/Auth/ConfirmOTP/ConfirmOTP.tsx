import React, { useState } from 'react';
import axios from 'axios';
import { Redirect } from 'react-router-dom';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';

import { REACT_APP_GLIFIC_REGISTRATION_API } from 'config';
import { Input } from 'components/UI/Form/Input/Input';
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
export interface ConfirmOTPProps {
  location: any;
}

export const ConfirmOTP: React.SFC<ConfirmOTPProps> = (props) => {
  const { location } = props;
  const [OTP, setOTP] = useState('');
  const [authSuccess, setAuthSuccess] = useState<any | string>('');
  const [authError, setAuthError] = useState('');
  const { t } = useTranslation();

  const handleResend = () => {
    sendOTP(location.state.phoneNumber, 'true')
      .then((response) => response)
      .catch(() => {
        setAuthError(t('We are unable to generate an OTP, kindly contact your technical team.'));
      });
  };

  // Let's not allow direct navigation to this page
  if (location && location.state === undefined) {
    return <Redirect to="/registration" />;
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
      .post(REACT_APP_GLIFIC_REGISTRATION_API, {
        user: {
          name: location.state.name,
          phone: location.state.phoneNumber,
          password: location.state.password,
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
              name: location.state.name,
              phone: location.state.phoneNumber,
              otp: values.OTP,
            },
          }} URL:${REACT_APP_GLIFIC_REGISTRATION_API}`,
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
