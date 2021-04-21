import React, { useState } from 'react';
import * as Yup from 'yup';

import { Input } from '../../../components/UI/Form/Input/Input';
import { Organization } from '../Organization';
import { PhoneInput } from '../../../components/UI/Form/PhoneInput/PhoneInput';
import { InputURL } from '../../../components/UI/Form/InputURL/InputURL';

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
    name: 'api_name',
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
    name: 'userName',
    type: 'text',
    placeholder: 'Your name',
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
  api_name: Yup.string().required('App name is required'),
  api_key: Yup.string()
    .test('len', 'Invalid API Key', (val) => val?.length === 32)
    .required('GupShup name is required'),
  userName: Yup.string().required('Input is required'),
  email: Yup.string().email().required('Email is required'),
  shortcode: Yup.string().required('NGO url is required'),
});

const initialFormValues = {
  name: '',
  phone: '',
  api_name: '',
  api_key: '',
  userName: '',
  email: '',
  shortcode: '',
};

export const Registration: React.SFC<RegistrationProps> = () => {
  const [registrationError, setRegistrationError] = useState('');

  const handleSubmit = (values: any) => {
    console.log(values);
    console.log(setRegistrationError);
    //  TODO: error callback set setRegistrationError(error)
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
