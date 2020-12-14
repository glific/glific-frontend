import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import * as Yup from 'yup';

import styles from './Registration.module.css';
import { Input } from '../../../components/UI/Form/Input/Input';
import { Auth } from '../Auth';
import { PhoneInput } from '../../../components/UI/Form/PhoneInput/PhoneInput';
import { sendOTP } from '../../../services/AuthService';
import { ReactComponent as InfoIcon } from '../../../assets/images/icons/Info.svg';

export interface RegistrationProps {}

export const Registration: React.SFC<RegistrationProps> = () => {
  const [redirect, setRedirect] = useState(false);
  const [user, setUser] = useState({ userName: '', phone: '', password: '' });
  const [authError, setAuthError] = useState('');

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
      component: PhoneInput,
      name: 'phone',
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
    userName: Yup.string().required('Input required'),
    phone: Yup.string().required('Input required').min(11, 'Please enter a valid phone number.'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters long.')
      .required('Input required'),
  });

  const initialFormValues = { userName: '', phone: '', password: '' };

  const onSubmitRegistration = (values: any) => {
    sendOTP(values.phone, 'true')
      .then(() => {
        setUser(values);
        setRedirect(true);
      })
      .catch(() => {
        setAuthError('We are unable to register, kindly contact your technical team.');
      });
  };

  const staffInstructions = (
    <div className={styles.Instructions}>
      <InfoIcon />
      <div>
        Please make sure to optin to your gupshup number(by clicking signupforservices url) before
        creating your account.
      </div>
    </div>
  );

  return (
    <Auth
      pageTitle="Create your new account"
      buttonText="CONTINUE"
      staffInstructions={staffInstructions}
      alternateLink="login"
      alternateText="LOGIN TO GLIFIC"
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
