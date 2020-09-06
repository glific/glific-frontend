import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import * as Yup from 'yup';

import { Auth } from '../Auth';
import { PhoneInput } from '../../../components/UI/Form/PhoneInput/PhoneInput';
import { sendOTP } from '../../../services/AuthService';

export interface ResetPasswordPhoneProps {}

export const ResetPasswordPhone: React.SFC<ResetPasswordPhoneProps> = () => {
  const [values, setValues] = useState({ phoneNumber: '' });
  const [redirect, setRedirect] = useState(false);

  if (redirect) {
    return (
      <Redirect
        to={{
          pathname: '/resetpassword-confirmotp',
          state: {
            phoneNumber: values.phoneNumber,
          },
        }}
      />
    );
  }

  const onSubmitPhone = (values: any) => {
    sendOTP(values.phoneNumber).then((response) => {
      setValues(values);
      setRedirect(true);
    });
  };

  const formFields = [
    {
      component: PhoneInput,
      name: 'phoneNumber',
      type: 'phone',
      placeholder: 'Phone number',
      helperText: 'Please enter a phone number.',
    },
  ];

  const FormSchema = Yup.object().shape({
    phoneNumber: Yup.string().required('Input required'),
  });

  const initialFormValues = { phoneNumber: '' };

  return (
    <Auth
      pageTitle={'Reset your password'}
      buttonText={'GENERATE OTP TO CONFIRM'}
      alternateLink={'login'}
      alternateText={'GO TO LOGIN'}
      mode={'firstreset'}
      formFields={formFields}
      titleSubText="Please confirm your phone number to proceed"
      validationSchema={FormSchema}
      saveHandler={onSubmitPhone}
      initialFormValues={initialFormValues}
    />
  );
};
