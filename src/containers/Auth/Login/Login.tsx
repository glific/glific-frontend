import React, { useState, useContext, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';
import * as Yup from 'yup';
import { useLazyQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';

import { USER_SESSION } from '../../../config/index';
import { SessionContext } from '../../../context/session';
import { Auth } from '../Auth';
import { PhoneInput } from '../../../components/UI/Form/PhoneInput/PhoneInput';
import { Input } from '../../../components/UI/Form/Input/Input';
import {
  setAuthSession,
  clearAuthSession,
  getAuthSession,
  setUserSession,
  clearUserSession,
} from '../../../services/AuthService';
import { GET_CURRENT_USER } from '../../../graphql/queries/User';
import { getRoleBasedAccess } from '../../../context/role';
import setLogs from '../../../config/logs';

const notApprovedMsg = 'Your account is not approved yet. Please contact your organisation admin.';

export interface LoginProps {}

export const Login: React.SFC<LoginProps> = () => {
  const { setAuthenticated } = useContext(SessionContext);
  const [sessionToken, setSessionToken] = useState('');
  const [authError, setAuthError] = useState('');
  const { i18n } = useTranslation();

  // function to unauthorize access
  const accessDenied = () => {
    setAuthError(notApprovedMsg);
    clearAuthSession();
    clearUserSession();
  };

  // get the information on current user
  const [getCurrentUser, { data: userData, error: userError }] = useLazyQuery(GET_CURRENT_USER);

  useEffect(() => {
    if (userData) {
      // set the current user object
      setUserSession(JSON.stringify(userData.currentUser.user));

      // get the roles
      const { roles } = userData.currentUser.user;

      // check for user role none or empty
      if ((roles.includes('None') && roles.length === 1) || roles.length === 0) {
        accessDenied();
      } else {
        // needed to redirect after login
        setAuthenticated(true);
        const token: any = getAuthSession();
        setSessionToken(token);

        // role & access permissions
        getRoleBasedAccess();

        // set the language
        if (i18n.changeLanguage) {
          i18n.changeLanguage(userData.currentUser.user?.language.locale);
        }
      }
    }
    if (userError) {
      accessDenied();
    }
  }, [userData, userError, setAuthenticated]);

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
        getCurrentUser();
        setAuthSession(responseString);
      })
      .catch((error) => {
        setAuthError('Invalid phone or password.');
        // add log's
        setLogs(`phoneNumber:${values.phoneNumber} URL:${USER_SESSION}`, 'info');
        setLogs(error, 'error');
      });
  };

  return (
    <Auth
      pageTitle="Login to your account"
      buttonText="LOGIN"
      alternateLink="registration"
      alternateText="CREATE A NEW ACCOUNT"
      mode="login"
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
