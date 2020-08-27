import React, { useState, useContext } from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';
import * as Yup from 'yup';
import { USER_SESSION } from '../../../common/constants';
import { SessionContext } from '../../../context/session';
import Auth from '../Auth';
import PhoneInput from '../../../components/UI/Form/PhoneInput/PhoneInput';
import { Input } from '../../../components/UI/Form/Input/Input';

export interface LoginProps {}

export const Login: React.SFC<LoginProps> = () => {
  const { setAuthenticated } = useContext(SessionContext);
  const [sessionToken, setSessionToken] = useState('');
  const [authError, setAuthError] = useState('');

  if (sessionToken) {
    return (
      <Redirect
        to={{
          pathname: '/chat',
          state: {
            tokens: sessionToken,
          },
        }}
      />
    );
  }

  const formFields = [
    {
      component: PhoneInput,
      name: 'phoneNumber',
      type: 'phone',
      placeholder: 'Your phone number',
      helperText: 'Please enter a phone number.',
    },
    {
      component: Input,
      name: 'password',
      type: 'password',
      placeholder: 'Password',
    },
  ];

  const FormSchema = Yup.object().shape({
    phoneNumber: Yup.string().required('Input required'),
    password: Yup.string().required('Input required'),
  });

  const initialFormValues = { phoneNumber: '', password: '' };

  const onSubmitLogin = (values: any) => {
    setAuthError('');
    axios
      .post(USER_SESSION, {
        user: {
          phone: values.phoneNumber,
          password: values.password,
        },
      })
      .then((response: any) => {
        const responseString = JSON.stringify(response.data.data);
        localStorage.setItem('glific_session', responseString);
        setAuthenticated(true);
        setSessionToken(responseString);
      })
      .catch((error: any) => {
        console.log('error', error);
        setAuthError('Invalid phone or password.');
      });
  };

  return (
    <Auth
      pageTitle={'Login to your account'}
      buttonText={'LOGIN'}
      alternateLink={'registration'}
      alternateText={'CREATE A NEW ACCOUNT'}
      mode={'login'}
      formFields={formFields}
      linkText="Forgot Password?"
      linkURL="resetpassword-phone"
      validationSchema={FormSchema}
      saveHandler={onSubmitLogin}
      initialFormValues={initialFormValues}
      errorMessage={authError}
    />
  );
};

export default Login;
