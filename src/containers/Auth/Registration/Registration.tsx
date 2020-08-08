import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';
import * as Yup from 'yup';
import { Input } from '../../../components/UI/Form/Input/Input';
import { REACT_APP_GLIFIC_AUTHENTICATION_API } from '../../../common/constants';
import Auth from '../Auth';

export interface RegistrationProps {}

export const Registration: React.SFC<RegistrationProps> = () => {
  const [redirect, setRedirect] = useState(false);
  const [user, setUser] = useState({ userName: '', phone: '', password: '' });

  if (redirect) {
    return (
      <Redirect
        to={{
          pathname: '/confirmotp',
          state: {
            name: user.userName,
            phoneNumber: user.phone,
            password: user.password,
          },
        }}
      />
    );
  }

  const formFields = [
    {
      component: Input,
      name: 'userName',
      type: 'text',
      placeholder: 'Your username',
    },
    {
      component: Input,
      name: 'phone',
      type: 'text',
      placeholder: 'Your phone number',
    },
    {
      component: Input,
      name: 'password',
      type: 'password',
      placeholder: 'Password',
    },
  ];

  const initialFormikValues = {};

  const FormSchema = Yup.object().shape({
    userName: Yup.string().required('Input required'),
    phone: Yup.string().required('Input required').min(11, 'Please enter a valid phone number.'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters long.')
      .required('Input required'),
  });

  const onSubmitRegistration = (values: any) => {
    axios
      .post(REACT_APP_GLIFIC_AUTHENTICATION_API, {
        user: {
          phone: values.phone,
        },
      })
      .then((response) => {
        console.log(values);
        setUser(values);
        setRedirect(true);
      });
  };

  return (
    <Auth
      pageTitle={'Create your new account'}
      buttonText={'CONTINUE'}
      alternateLink={'login'}
      alternateText={'LOGIN TO GLIFIC'}
      mode={'registration'}
      formFields={formFields}
      validationSchema={FormSchema}
      onFormikSubmit={onSubmitRegistration}
      initialFormikValues={initialFormikValues}
    />
  );
};

export default Registration;
