import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';
import * as Yup from 'yup';

import { RESET_PASSWORD } from '../../../common/constants';
import Auth from '../Auth';
import { Input } from '../../../components/UI/Form/Input/Input';
import { PhoneInput } from '../../../components/UI/Form/PhoneInput/PhoneInput';
import { sendOTP } from '../../../services/AuthService';

export interface ResetPasswordConfirmOTPProps {
  location: any;
}

export const ResetPasswordConfirmOTP: React.SFC<ResetPasswordConfirmOTPProps> = (props) => {
  const [redirect, setRedirect] = useState(false);

  // Let's not allow direct navigation to this page
  if (props.location && props.location.state === undefined) {
    return <Redirect to={'/resetpassword-phone'} />;
  }

  if (redirect) {
    return <Redirect to="/login" />;
  }

  const handleResend = () => {
    sendOTP(props.location.state.phoneNumber);
  };

  const formFields = [
    {
      component: PhoneInput,
      name: 'phoneNumber',
      type: 'phone',
      placeholder: 'Phone number',
      helperText: 'Please enter a phone number.',
    },
    {
      component: Input,
      type: 'otp',
      name: 'OTP',
      placeholder: 'OTP',
      helperText: 'Please confirm the OTP received at your whatsapp number.',
      endAdornmentCallback: handleResend,
    },
    {
      component: Input,
      name: 'password',
      type: 'password',
      placeholder: 'New Password',
    },
  ];

  const FormSchema = Yup.object().shape({
    OTP: Yup.string().required('Input required'),
    password: Yup.string()
      .min(6, 'Password must be at least 8 characters long.')
      .required('Input required'),
  });

  const initialFormValues = {
    phoneNumber: props.location.state.phoneNumber,
    OTP: '',
    password: '',
  };

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
      saveHandler={onSubmitOTP}
      initialFormValues={initialFormValues}
    />
  );
};
