import React, { useState } from 'react';
import * as Yup from 'yup';
import axios from 'axios';
import { Redirect } from 'react-router-dom';
import { InputAdornment } from '@material-ui/core';
import InfoIcon from '@material-ui/icons/InfoSharp';

import { Input } from '../../../components/UI/Form/Input/Input';
import { Organization } from '../Organization';
import { PhoneInput } from '../../../components/UI/Form/PhoneInput/PhoneInput';
import { ONBOARD_URL } from '../../../config/index';
import Tooltip from '../../../components/UI/Tooltip/Tooltip';
import styles from './Registration.module.css';

export interface RegistrationProps {}

const InfoAdornment = (
  <InputAdornment position="end">
    <Tooltip
      title="You can customize your Glific account URL as shown in preview"
      placement="right"
      tooltipClass={styles.Tooltip}
    >
      <InfoIcon aria-label="info" fontSize="small" className={styles.InfoIconColor} />
    </Tooltip>
  </InputAdornment>
);

const formFields = [
  {
    component: Input,
    name: 'name',
    type: 'text',
    placeholder: 'NGO name',
  },
  {
    component: PhoneInput,
    name: 'phone',
    type: 'phone',
    placeholder: 'NGO WhatsApp number',
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
    endAdornment: InfoAdornment,
    helperLink:
      'https://www.gupshup.io/developer/docs/bot-platform/guide/whatsapp-api-documentation',
  },
  {
    component: Input,
    name: 'shortcode',
    type: 'text',
    placeholder: 'URL Shortcode',
    helperText: 'www.shortcode.tides.coloredcow.com',
  },
  {
    component: Input,
    name: 'email',
    type: 'text',
    placeholder: 'Your email id',
  },
];

const FormSchema = Yup.object().shape({
  name: Yup.string().required('NGO name is required'),
  phone: Yup.string().required('NGO whatsapp number is required'),
  app_name: Yup.string().required('App name is required'),
  api_key: Yup.string()
    .test('len', 'Invalid API Key', (val) => val?.length === 32)
    .required('API key is required'),
  email: Yup.string().email().required('Email is required'),
  shortcode: Yup.string().required('NGO shortcode url is required'),
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
