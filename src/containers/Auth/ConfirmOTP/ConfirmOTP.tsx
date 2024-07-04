import { useEffect, useState } from 'react';
import axios from 'axios';
import { Navigate, useLocation } from 'react-router-dom';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';

import { VITE_GLIFIC_REGISTRATION_API } from 'config';
import { Input } from 'components/UI/Form/Input/Input';
import { sendOTP } from 'services/AuthService';
import setLogs from 'config/logs';
import { IconButton, InputAdornment } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Captcha } from 'components/UI/Form/Captcha/Captcha';
import styles from './ConfirmOTP.module.css';
import { Auth } from '../Auth';
import { User } from '../Registration/Registration';

// let's define registration success message
const successMessage = (
  <div>
    Your account is registered successfully. Please contact your organization admin for the
    approval. Click&nbsp;<a href="/login">here</a>&nbsp;for login.
  </div>
);

export const ConfirmOTP = () => {
  const [OTP, setOTP] = useState('');
  const [authSuccess, setAuthSuccess] = useState<any | string>('');
  const [authError, setAuthError] = useState('');
  const { t } = useTranslation();
  const location = useLocation();
  const [userObject, setUserObject] = useState<User>();
  const [token, setToken] = useState('');

  useEffect(() => {
    const state = location.state as User;
    if (state) {
      setUserObject(state);
    }
  }, [location]);

  const handleResend = () => {
    if (!userObject) {
      return;
    }
    sendOTP(userObject.phone, token)
      .then((response) => response)
      .catch(() => {
        setAuthError(t('We are unable to generate an OTP, kindly contact your technical team.'));
      });
  };

  // Let's not allow direct navigation to this page
  if (location && !location.state) {
    return <Navigate to="/registration" />;
  }

  const states = { OTP };
  const setStates = ({ OTPValue }: any) => {
    setOTP(OTPValue);
  };

  const endAdornment = (
    <InputAdornment position="end">
      <Captcha
        component={IconButton}
        aria-label="resend otp"
        data-testid="resendOtp"
        onClick={handleResend}
        edge="end"
        action="resend"
        onTokenUpdate={(tokenString: string) => setToken(tokenString)}
      >
        <p className={styles.Resend}>resend</p>{' '}
        <RefreshIcon classes={{ root: styles.ResendButton }} />
      </Captcha>
    </InputAdornment>
  );

  const formFields = [
    {
      component: Input,
      type: 'otp',
      name: 'OTP',
      placeholder: 'OTP',
      helperText: t('Please confirm the OTP received at your WhatsApp number.'),
      endAdornment,
    },
  ];

  const FormSchema = Yup.object().shape({
    OTP: Yup.string().required(t('Input required')),
  });

  const initialFormValues = { OTP: '' };

  const onSubmitOTP = (values: any) => {
    if (!userObject) {
      return;
    }

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
