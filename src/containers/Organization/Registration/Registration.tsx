import React, { useState } from 'react';
import * as Yup from 'yup';
import axios from 'axios';
import { Redirect } from 'react-router-dom';

import { Input } from '../../../components/UI/Form/Input/Input';
import { Organization } from '../Organization';
import { PhoneInput } from '../../../components/UI/Form/PhoneInput/PhoneInput';
import { InputURL } from '../../../components/UI/Form/InputURL/InputURL';
import { ONBOARD_URL } from '../../../config/index';

export interface RegistrationProps {}

const formFields = [
  {
    component: Input,
    name: 'name',
    type: 'text',
    placeholder: 'Organisation name',
  },
  {
    component: PhoneInput,
    name: 'phone',
    type: 'phone',
    placeholder: 'NGO whatsapp number',
    helperText: 'Please enter a phone number.',
  },
  {
    component: Input,
    name: 'app_name',
    type: 'text',
    placeholder: 'App name',
  },
  {
    component: Input,
    name: 'api_key',
    type: 'text',
    placeholder: 'GupShup API keys',
    helperLink:
      'https://www.gupshup.io/developer/docs/bot-platform/guide/whatsapp-api-documentation',
  },
  {
    component: Input,
    name: 'email',
    type: 'text',
    placeholder: 'Your email',
  },
  {
    component: InputURL,
    name: 'shortcode',
    type: 'text',
    placeholder: 'NGO name',
  },
];

const FormSchema = Yup.object().shape({
  name: Yup.string().required('Organisation name is required'),
  phone: Yup.string().required('NGO whatsapp number is required'),
  app_name: Yup.string().required('App name is required'),
  api_key: Yup.string()
    .test('len', 'Invalid API Key', (val) => val?.length === 32)
    .required('GupShup name is required'),
  email: Yup.string().email().required('Email is required'),
  shortcode: Yup.string().required('NGO url is required'),
});

const initialFormValues = {
  name: '',
  phone: '',
  app_name: '',
  api_key: '',
  email: '',
  shortcode: '',
};

export const Registration: React.SFC<RegistrationProps> = () => {
  const [registrationError, setRegistrationError] = useState('');
  const [redirect, setRedirect] = useState(false);

  if (redirect) {
    return (
      <Redirect
        to={{
          pathname: '/registration',
        }}
      />
    );
  }

  const handleSubmit = (values: any, captcha: any) => {
    console.log('values:', values, 'captcha:', captcha);

    axios.post(ONBOARD_URL, values).then(({ data }: { data: any }) => {
      if (data.is_valid && captcha !== '') {
        setRedirect(true);
      } else {
        // add error message for not checking captcha
        setRegistrationError(data.messages);
      }
    });
  };

  return (
    <Organization
      pageTitle="Setup your NGO on Glific"
      buttonText="GET STARTED"
      formFields={formFields}
      validationSchema={FormSchema}
      saveHandler={handleSubmit}
      initialFormValues={initialFormValues}
      errorMessage={registrationError}
    />
  );
};

export default Registration;
