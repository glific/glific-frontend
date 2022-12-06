import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { Input } from 'components/UI/Form/Input/Input';
import { PhoneInput } from 'components/UI/Form/PhoneInput/PhoneInput';
import { sendOTP } from 'services/AuthService';
import { Auth } from '../Auth';

export const Registration = () => {
  const [redirect, setRedirect] = useState(false);
  const [user, setUser] = useState({ userName: '', phone: '', password: '' });
  const [authError, setAuthError] = useState<any>('');
  const { t } = useTranslation();

  if (redirect) {
    const stateObject = { name: user.userName, phoneNumber: user.phone, password: user.password };
    return <Navigate to="/confirmotp" replace state={stateObject} />;
  }

  const onSubmitRegistration = (values: any, captcha: any) => {
    if (captcha) {
      sendOTP(values.phone, 'true')
        .then(() => {
          setUser(values);
          setRedirect(true);
        })
        .catch(() => {
          setAuthError(t('We are unable to register, kindly contact your technical team.'));
        });
    }
  };

  const formFields = [
    {
      component: Input,
      name: 'userName',
      type: 'text',
      placeholder: t('Your full name'),
    },
    {
      component: PhoneInput,
      name: 'phone',
      type: 'phone',
      placeholder: t('Your personal WhatsApp number'),
      helperText: t('Please enter a phone number.'),
    },
    {
      component: Input,
      name: 'password',
      type: 'password',
      placeholder: t('Password'),
    },
  ];

  const FormSchema = Yup.object().shape({
    userName: Yup.string().required(t('Input required')),
    phone: Yup.string().required(t('Input required')),
    password: Yup.string()
      .min(8, t('Password must be at least 8 characters long.'))
      .required(t('Input required')),
  });

  const initialFormValues = { userName: '', phone: '', password: '' };

  return (
    <Auth
      pageTitle={t('Create your new account')}
      buttonText={t('Register with ')}
      alternateLink="login"
      alternateText={t('Login to Glific')}
      mode="registration"
      formFields={formFields}
      validationSchema={FormSchema}
      saveHandler={onSubmitRegistration}
      initialFormValues={initialFormValues}
      errorMessage={authError}
    />
  );
};

export default Registration;
