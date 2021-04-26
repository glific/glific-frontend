import React, { useState } from 'react';
import * as Yup from 'yup';
import axios from 'axios';
import { Redirect } from 'react-router-dom';
import { InputAdornment, Link } from '@material-ui/core';

import { Input } from '../../../components/UI/Form/Input/Input';
import { Organization } from '../Organization';
import { PhoneInput } from '../../../components/UI/Form/PhoneInput/PhoneInput';
import { ONBOARD_URL } from '../../../config/index';
import Tooltip from '../../../components/UI/Tooltip/Tooltip';
import styles from './Registration.module.css';
import { ReactComponent as InfoIcon } from '../../../assets/images/icons/Info.svg';

export interface RegistrationProps {}

const InfoAdornment = (
  <InputAdornment position="end">
    <Tooltip
      title="You can customize your Glific account URL as shown in preview"
      placement="right"
      tooltipClass={styles.Tooltip}
    >
      <InfoIcon width="12" height="12" />
    </Tooltip>
  </InputAdornment>
);

const HelperLink = (
  <Link
    className={styles.HelperLink}
    href="https://www.gupshup.io/developer/docs/bot-platform/guide/whatsapp-api-documentation"
    rel="noreferrer"
    target="_blank"
  >
    Help?
  </Link>
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
    helperText: HelperLink,
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
          pathname: '/onboard-success',
        }}
      />
    );
  }

  const handleSubmit = (values: any, captcha: any, setErrors: any, setLoading: any) => {
    if (captcha) {
      axios.post(ONBOARD_URL, values).then(({ data }: { data: any }) => {
        if (data.is_valid) {
          setRedirect(true);
        } else {
          setRegistrationError(data.messages?.global);
          if (setErrors && setLoading) {
            const errors = data.messages;
            delete errors.global;
            setErrors(data.messages);
            setLoading(false);
          }
        }
      });
    }
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
