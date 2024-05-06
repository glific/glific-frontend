import { Input } from 'components/UI/Form/Input/Input';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { PhoneInput } from 'components/UI/Form/PhoneInput/PhoneInput';
import { FormLayout } from '../FormLayout/FormLayout';
import { useState } from 'react';

import styles from '../FormLayout/FormLayout.module.css';

export const PlatformDetails = () => {
  const { t } = useTranslation();
  const [appName, setAppName] = useState<string>('');
  const [apiKeys, setApiKeys] = useState<string>('');
  const [shortcode, setShortcode] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');

  const FormSchema = Yup.object().shape({
    appName: Yup.string().required(t('This Field is required.')),
    apiKeys: Yup.string().required(t('This Field is required.')),
    shortcode: Yup.string().required(t('This Field is required.')),
    phoneNumber: Yup.string().required(t('This Field is required.')),
  });
  const initialFormValues: any = { appName, apiKeys, shortcode, phoneNumber };

  const formFields = [
    {
      component: PhoneInput,
      name: 'phoneNumber',
      type: 'phone',
      placeholder: 'New whatsapp chatbot number',
      inputLabel: 'Chatbot number',
      helperText: t('Please enter a phone number.'),
    },
    {
      component: Input,
      name: 'appName',
      type: 'text',
      inputLabel: 'App name',
      placeholder: 'Enter the bot name',
      inputLabelSubtext: (
        <p className={styles.SubText}>
          (Name of your bot on Gupshup. <a href="gupshup.com">Find it here</a>)
        </p>
      ),
    },
    {
      component: Input,
      name: 'apiKeys',
      type: 'text',
      inputLabel: 'Gupshup API keys',
      placeholder: 'Enter the api keys',
      inputLabelSubtext: (
        <span className={styles.SubText}>
          (<a>Click here</a> to get the API keys)
        </span>
      ),
    },
    {
      component: Input,
      name: 'shortcode',
      type: 'text',
      inputLabel: 'URL shortcode',
      placeholder: 'Atleast 7-8 characters',
      inputLabelSubtext: (
        <span className={styles.SubText}>(Name you want to give your Glific platform)</span>
      ),
    },
  ];

  const setPayload = (payload: any) => {
    const { appName, shortcode, apiKeys, phoneNumber } = payload;
    return {
      api_key: apiKeys,
      app_name: appName,
      phone: phoneNumber,
      shortcode,
    };
  };

  const setStates = (states: any) => {
    const { app_name, shortcode, api_key, phone } = states;

    setAppName(app_name);
    setShortcode(shortcode);
    setApiKeys(api_key);
    setPhoneNumber(phone);
  };

  return (
    <FormLayout
      validationSchema={FormSchema}
      formFieldItems={formFields}
      initialValues={initialFormValues}
      step={1}
      title="Glific platform details"
      helperText="Add platform details and information based on the data queries."
      setStates={setStates}
      setPayload={setPayload}
      identifier="platformDetails"
    />
  );
};
