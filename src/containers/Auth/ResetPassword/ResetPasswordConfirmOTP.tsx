import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import Auth from '../Auth';
import { RESET_PASSWORD } from '../../../common/constants';
import axios from 'axios';
import * as Yup from 'yup';
import { Input } from '../../../components/UI/Form/Input/Input';

export interface ResetPasswordConfirmOTPProps {
  location: any;
}

export const ResetPasswordConfirmOTP: React.SFC<ResetPasswordConfirmOTPProps> = (props) => {
  const [redirect, setRedirect] = useState(false);

  if (redirect) {
    return <Redirect to="/login" />;
  }

  const FormSchema = Yup.object().shape({
    OTP: Yup.string().required('Input required'),
    password: Yup.string()
      .min(6, 'Password must be at least 8 characters long.')
      .required('Input required'),
  });

  const initialFormikValues = { phoneNumber: props.location.state.phoneNumber };

  const formFields = [
    {
      component: Input,
      name: 'phoneNumber',
      placeholder: 'Phone number',
    },
    {
      component: Input,
      name: 'OTP',
      placeholder: 'OTP',
    },
    {
      component: Input,
      name: 'password',
      placeholder: 'New Password',
    },
  ];

  const onSubmitOTP = (values: any) => {
    axios
      .post(RESET_PASSWORD, {
        user: {
          phone: values.phoneNumber,
          password: values.password,
          otp: values.OTP,
        },
      })
      .then((response) => {
        setRedirect(true);
      });
  };

  return (
    <Auth
      pageTitle={'Reset your password'}
      buttonText={'SAVE'}
      alternateLink={'login'}
      alternateText={'GO TO LOGIN'}
      mode={'secondreset'}
      formFields={formFields}
      validationSchema={FormSchema}
      onFormikSubmit={onSubmitOTP}
      initialFormikValues={initialFormikValues}
    />
  );
};
