import React, { useState, useContext, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';
import * as Yup from 'yup';

import { USER_SESSION } from '../../../common/constants';
import { SessionContext } from '../../../context/session';
import { RoleContext, setUserRole } from '../../../context/role';
import { Auth } from '../Auth';
import { PhoneInput } from '../../../components/UI/Form/PhoneInput/PhoneInput';
import { Input } from '../../../components/UI/Form/Input/Input';
import { setAuthSession } from '../../../services/AuthService';
import { useLazyQuery } from '@apollo/client';
import { GET_CURRENT_USER } from '../../../graphql/queries/User';

const NotApprovedMsg = 'Your account is not approved yet. Please contact your organisation admin.';

export interface LoginProps {}

export const Login: React.SFC<LoginProps> = () => {
  const { setAuthenticated } = useContext(SessionContext);
  const { setRole } = useContext(RoleContext);
  const [sessionToken, setSessionToken] = useState('');
  const [authError, setAuthError] = useState('');

  // get the information on current user
  const [getCurrentUser, { data: userData }] = useLazyQuery(GET_CURRENT_USER);

  useEffect(() => {
    if (userData) {
      let roles = userData.currentUser.user.roles;
      // check for user role none or empty
      if (roles.includes('none') || roles.length === 0) {
        setAuthError(NotApprovedMsg);
        localStorage.removeItem('glific_session');
      } else {
        setRole(roles);
        setUserRole(roles);

        // needed to redirect after login
        setAuthenticated(true);
        const token: any = localStorage.getItem('glific_session');
        setSessionToken(token);
      }
    }
  }, [userData]);

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
        // fetch login user data to check user role
        getCurrentUser();
        setAuthSession(responseString);
      })
      .catch((error: any) => {
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
