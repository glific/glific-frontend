import { useState, useEffect } from 'react';
import { Navigate } from 'react-router';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { yupPasswordValidation } from 'common/constants';
import { Input } from 'components/UI/Form/Input/Input';
import { PhoneInput } from 'components/UI/Form/PhoneInput/PhoneInput';
import { sendOTP } from 'services/AuthService';
import { Checkbox } from 'components/UI/Form/Checkbox/Checkbox';
import { Auth } from '../Auth';
import styles from './Registration.module.css';
import { ORGANIZATION_NAME } from 'config';
import axios from 'axios';
import setLogs from 'config/logs';

export interface User {
  name: string;
  phone: string;
  password: string;
  captcha: string;
  email: string;
  consent_for_updates: boolean;
  organization_name: string;
}

const initialFormValues: User = {
  name: '',
  phone: '',
  password: '',
  captcha: '',
  email: '',
  consent_for_updates: true,
  organization_name: '',
};

export const Registration = () => {
  const [redirect, setRedirect] = useState(false);
  const [user, setUser] = useState<User>(initialFormValues);
  const [authError, setAuthError] = useState<any>('');
  const { t } = useTranslation();

  const [is_trial, setTrial] = useState('');
  useEffect(() => {
    axios
      .post(ORGANIZATION_NAME)
      .then(({ data }) => {
        setTrial(data?.data?.is_trial);
      })
      .catch((error) => setLogs(`orgName error ${JSON.stringify(error)}`, error));
  }, []);

  if (redirect) {
    return <Navigate to="/confirmotp" replace state={user} />;
  }

  console.log('data', is_trial);
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
    ...(is_trial
      ? [
          {
            component: Input,
            name: 'organization_name',
            type: 'text',
            placeholder: t('Organization Name'),
            darkMode: true,
            autoComplete: 'organization',
          },
        ]
      : []),
    {
      component: Checkbox,
      name: 'consent_for_updates',
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
    organization_name: Yup.string().required(t('Input required')),
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
