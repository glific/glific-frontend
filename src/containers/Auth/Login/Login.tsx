import React, { useState, useContext } from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';
import * as Yup from 'yup';
import { USER_SESSION } from '../../../common/constants';
import { SessionContext } from '../../../context/session';
import Auth from '../Auth';
import { Input } from '../../../components/UI/Form/Input/Input';

export interface LoginProps {}

export const Login: React.SFC<LoginProps> = () => {
  const { setAuthenticated } = useContext(SessionContext);
  const [sessionToken, setSessionToken] = useState('');

  const initialFormikValues = {};

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

  const FormSchema = Yup.object().shape({
    phoneNumber: Yup.string().required('Input required'),
    password: Yup.string().required('Input required'),
  });

  const formFields = [
    {
      component: Input,
      name: 'phoneNumber',
      type: 'text',
      placeholder: 'Phone number',
    },
    {
      component: Input,
      name: 'password',
      placeholder: 'Password',
    },
  ];

  const onSubmitLogin = (values: any) => {
    axios
      .post(USER_SESSION, {
        user: {
          phone: values.phoneNumber,
          password: values.password,
        },
      })
      .then((response: any) => {
        const responseString = JSON.stringify(response.data.data);
        localStorage.setItem('session', responseString);
        setAuthenticated(true);
        setSessionToken(responseString);
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
      onFormikSubmit={onSubmitLogin}
      initialFormikValues={initialFormikValues}
    />
  );
};

export default Login;
