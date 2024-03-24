import { useState } from 'react';
import axios from 'axios';
import { InputAdornment, Link } from '@mui/material';
import * as Yup from 'yup';

import { Input } from 'components/UI/Form/Input/Input';
import { PhoneInput } from 'components/UI/Form/PhoneInput/PhoneInput';
import Tooltip from 'components/UI/Tooltip/Tooltip';
import { Checkbox } from 'components/UI/Form/Checkbox/Checkbox';
import { ONBOARD_URL } from 'config';
import InfoIcon from 'assets/images/icons/Info.svg?react';
import { GUPSHUP_ACCOUNT_CREATION } from 'common/constants';
import { Organization } from '../Organization';
import styles from './Registration.module.css';

export interface RegistrationProps {
  title: string;
  buttonText: string;
  handleStep?: any;
}

const InfoAdornment = (
  <InputAdornment position="end" className={styles.InputAdornment}>
    <Tooltip
      title="You can customize your Glific account URL as shown in preview"
      placement="right"
      tooltipClass={styles.Tooltip}
    >
      <InfoIcon />
    </Tooltip>
  </InputAdornment>
);

const HelperLink = (
  <Link
    className={styles.HelperLink}
    href={GUPSHUP_ACCOUNT_CREATION}
    rel="noreferrer"
    target="_blank"
  >
    Help?
  </Link>
);

const CheckBoxWrapper = (props: any) => (
  <div className={styles.Wrapper}>
    <Checkbox {...props} />
  </div>
);

const FormSchema = Yup.object().shape({
  name: Yup.string().required('NGO name is required'),
  phone: Yup.string().required('Your chatbot number is required'),
  app_name: Yup.string().required('App name is required'),
  api_key: Yup.string()
    .test('len', 'Invalid API Key', (val) => val?.length === 32)
    .required('API key is required'),
  email: Yup.string().email().required('Email is required'),
  shortcode: Yup.string()
    .matches(/^[a-z0-9]+$/i, 'Only alphanumeric characters are allowed')
    .required('NGO shortcode url is required'),
});

const initialFormValues = {
  name: '',
  phone: '',
  app_name: '',
  api_key: '',
  email: '',
  shortcode: '',
  addSupportStaff: true,
  token: '',
};

const supportCheckboxTitle =
  'I agree to let Glific team create a support staff account on my Glific setup. This allows us to get better troubleshooting response to our issues.';

export const Registration = ({ title, buttonText, handleStep }: RegistrationProps) => {
  const [registrationError, setRegistrationError] = useState<any>('');
  const [code, setCode] = useState('shortcode');
  const [redirect, setRedirect] = useState(false);

  if (redirect) {
    handleStep();
  }

  const formFields = (shortcode: string) => [
    {
      component: Input,
      name: 'name',
      type: 'text',
      placeholder: 'NGO name',
      darkMode: true,
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
      darkMode: true,
    },
    {
      component: Input,
      name: 'api_key',
      type: 'text',
      placeholder: 'GupShup API keys',
      helperText: HelperLink,
      darkMode: true,
    },
    {
      component: Input,
      name: 'shortcode',
      type: 'text',
      placeholder: 'URL Shortcode',
      endAdornment: InfoAdornment,
      darkMode: true,
      helperText: `www.${shortcode}.tides.coloredcow.com`,
      inputProp: {
        onChange: (event: any) => {
          const { value } = event.target;
          let text = 'shortcode';
          if (value) text = value;
          setCode(text);
        },
      },
    },
    {
      component: Input,
      name: 'email',
      type: 'text',
      darkMode: true,
      placeholder: 'Your email id',
    },
    {
      component: CheckBoxWrapper,
      name: 'addSupportStaff',
      title: supportCheckboxTitle,
      darkCheckbox: false,
      checkboxType: 'iagree',
    },
  ];

  const handleSubmit = (values: any, setErrors: any, setLoading: any) => {
    if (!values.token) {
      return;
    }
    axios
      .post(ONBOARD_URL, values)
      .then(({ data }: { data: any }) => {
        if (data.is_valid) {
          setRedirect(true);
        } else {
          setRegistrationError(data.messages?.global);
          if (setErrors && setLoading) {
            const errors = data.messages;
            delete errors.global;
            setErrors(errors);
            setLoading(false);
          }
        }
      })
      .catch((error: any) => {
        if (error.response?.data && error.response?.data?.error) {
          setRegistrationError({
            global: error.response.data.error.message,
          });
        } else {
          setRegistrationError({
            global: 'Sorry! an error occured. Please contact the technical team for support',
          });
        }
        setLoading(false);
      });
  };

  return (
    <Organization
      pageTitle={title}
      buttonText={buttonText}
      formFields={formFields(code)}
      validationSchema={FormSchema}
      saveHandler={handleSubmit}
      errorMessage={registrationError}
      initialFormValues={initialFormValues}
    />
  );
};

export default Registration;
