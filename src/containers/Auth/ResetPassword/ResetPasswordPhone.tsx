import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';

import { PhoneInput } from 'components/UI/Form/PhoneInput/PhoneInput';
import { sendOTP } from 'services/AuthService';
import { Auth } from '../Auth';

export interface ResetPasswordPhoneProps {}

export const ResetPasswordPhone: React.FC<ResetPasswordPhoneProps> = () => {
  const [values, setValues] = useState({ phoneNumber: '' });
  const [redirect, setRedirect] = useState(false);
  const [authError, setAuthError] = useState('');
  const { t } = useTranslation();

  if (redirect) {
    return (
      <Redirect
        to={{
          pathname: '/resetpassword-confirmotp',
          state: {
            phoneNumber: values.phoneNumber,
          },
        }}
      />
    );
  }

  const onSubmitPhone = (data: any) => {
    sendOTP(data.phoneNumber)
      .then(() => {
        setValues(data);
        setRedirect(true);
      })
      .catch(() => {
        setAuthError(t('We are unable to generate an OTP, kindly contact your technical team.'));
      });
  };

  const formFields = [
    {
      component: PhoneInput,
      name: 'phoneNumber',
      type: 'phone',
      placeholder: t('Phone number'),
      helperText: t('Please enter a phone number.'),
    },
  ];

  const FormSchema = Yup.object().shape({
    phoneNumber: Yup.string().required(t('Input required')),
  });

  const initialFormValues = { phoneNumber: '' };

  return (
    <Auth
      pageTitle={t('Reset your password')}
      buttonText={t('Generate OTP to confirm')}
      alternateLink="login"
      alternateText={t('Go to login')}
      mode="firstreset"
      formFields={formFields}
      titleSubText={t('Please confirm your phone number to proceed')}
      validationSchema={FormSchema}
      saveHandler={onSubmitPhone}
      initialFormValues={initialFormValues}
      errorMessage={authError}
    />
  );
};

export default ResetPasswordPhone;
