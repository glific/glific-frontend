import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { yupPasswordValidation } from 'common/constants';
import { Input } from 'components/UI/Form/Input/Input';
import { PhoneInput } from 'components/UI/Form/PhoneInput/PhoneInput';
import { sendOTP } from 'services/AuthService';
import { Auth } from '../Auth';

export interface User {
  name: string;
  phone: string;
  password: string;
  captcha: string;
}

const initialFormValues: User = { name: '', phone: '', password: '', captcha: '' };

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
    name: Yup.string().required(t('Input required')),
    phone: Yup.string().required(t('Input required')),
    password: yupPasswordValidation(t),
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
