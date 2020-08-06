import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import Auth from '../Auth';
import { REACT_APP_GLIFIC_AUTHENTICATION_API } from '../../../common/constants';
import axios from 'axios';
import * as Yup from 'yup';
import { Input } from '../../../components/UI/Form/Input/Input';

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

  const FormSchema = Yup.object().shape({
    phoneNumber: Yup.string().required('Input required'),
  });

  const onSubmitPhone = (values: any) => {
    console.log(values);
    axios
      .post(REACT_APP_GLIFIC_AUTHENTICATION_API, {
        user: {
          phone: values.phoneNumber,
          registration: 'false',
        },
      })
      .then((response) => {
        setValues(values);
        setRedirect(true);
      });
  };

  const formFields = [
    {
      component: Input,
      name: 'phoneNumber',
      type: 'text',
      placeholder: 'Phone number',
    },
  ];

  const initialFormikValues = {};

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
      onFormikSubmit={onSubmitPhone}
      initialFormikValues={initialFormikValues}
    />
  );
};
