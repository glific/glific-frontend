import { useState } from 'react';
import { Navigate } from 'react-router';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { yupPasswordValidation } from 'common/constants';
import { Input } from 'components/UI/Form/Input/Input';
import { PhoneInput } from 'components/UI/Form/PhoneInput/PhoneInput';
import { sendOTP } from 'services/AuthService';
import { Auth } from '../Auth';
import { Checkbox } from 'components/UI/Form/Checkbox/Checkbox';
import styles from './Registration.module.css';

export interface User {
  name: string;
  phone: string;
  password: string;
  captcha: string;
  email: string;
  consent_for_updates: boolean;
}

const initialFormValues: User = {
  name: '',
  phone: '',
  password: '',
  captcha: '',
  email: '',
  consent_for_updates: false,
};

export const Registration = () => {
  const [redirect, setRedirect] = useState(false);
  const [user, setUser] = useState<User>(initialFormValues);
  const [authError, setAuthError] = useState<any>('');
  const { t } = useTranslation();

  if (redirect) {
    return <Navigate to="/confirmotp" replace state={user} />;
  }

  const onSubmitRegistration = (values: User) => {
    if (!values.captcha) {
      setAuthError(t('Invalid captcha'));
      return;
    }

    sendOTP(values.phone, values.captcha)
      .then(() => {
        setUser(values);
        setRedirect(true);
      })
      .catch((error: any) => {
        if (error.response && error.response.data) {
          setAuthError(error.response.data.error?.message);
        } else {
          setAuthError(t('We are unable to register, kindly contact your technical team.'));
        }
      });
  };

  const formFields = [
    {
      component: Input,
      name: 'name',
      type: 'text',
      placeholder: t('Your full name'),
      darkMode: true,
      autoComplete: 'name',
    },
    {
      component: Input,
      name: 'email',
      type: 'email',
      placeholder: t('Email'),
      darkMode: true,
      autoComplete: 'email',
    },
    {
      component: PhoneInput,
      name: 'phone',
      type: 'phone',
      placeholder: t('Your personal WhatsApp number'),
      helperText: t('Please enter a phone number.'),
      inputProps: {
        autoComplete: 'tel',
      },
    },
    {
      component: Input,
      name: 'password',
      type: 'password',
      placeholder: t('Password'),
      darkMode: true,
      autoComplete: 'new-password',
    },
    {
      component: Checkbox,
      name: 'consent',
      label: 'I would like to receive product updates',
      styles: styles.CheckboxInline,
      labelPlacement: 'end',
      darkCheckbox: true,
    },
  ];

  const FormSchema = Yup.object().shape({
    name: Yup.string().required(t('Input required')),
    phone: Yup.string().required(t('Input required')),
    password: yupPasswordValidation(t),
    email: Yup.string().email(t('Email is invalid')).required(t('Email is required.')),
  });

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
