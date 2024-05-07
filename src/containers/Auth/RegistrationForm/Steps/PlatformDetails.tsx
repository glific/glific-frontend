import { Input } from 'components/UI/Form/Input/Input';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { PhoneInput } from 'components/UI/Form/PhoneInput/PhoneInput';
import { FormLayout } from '../FormLayout/FormLayout';
import { useState } from 'react';

import styles from '../FormLayout/FormLayout.module.css';
import { FormStepProps } from './OrgDetails';

export const PlatformDetails = ({ handleStepChange, saveData }: FormStepProps) => {
  const { t } = useTranslation();
  const [app_name, setAppName] = useState<string>('');
  const [api_key, setApiKeys] = useState<string>('');
  const [shortcode, setShortcode] = useState<string>('');
  const [phone, setPhone] = useState<string>('');

  const FormSchema = Yup.object().shape({
    app_name: Yup.string().required(t('This Field is required.')),
    api_key: Yup.string().required(t('This Field is required.')),
    shortcode: Yup.string().required(t('This Field is required.')),
    phone: Yup.string().required(t('This Field is required.')),
  });
  const initialFormValues: any = { app_name, api_key, shortcode, phone };

  const formFields = [
    {
      component: PhoneInput,
      name: 'phone',
      type: 'phone',
      placeholder: 'New whatsapp chatbot number',
      inputLabel: 'Chatbot number',
      helperText: t('Please enter a phone number.'),
    },
    {
      component: Input,
      name: 'app_name',
      type: 'text',
      inputLabel: 'App name',
      placeholder: 'Enter the bot name',
      inputLabelSubtext: (
        <p className={styles.SubText}>
          (Name of your bot on Gupshup.{' '}
          <a href="https://www.gupshup.io/whatsapp/dashboard/?lang=en">Find it here</a>)
        </p>
      ),
    },
    {
      component: Input,
      name: 'api_key',
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
    const { app_name, shortcode, api_key, phone } = payload;

    return {
      api_key,
      app_name,
      phone,
      shortcode,
    };
  };

  const setStates = (states: any) => {
    const { api_key, app_name, phone, shortcode } = states;

    setAppName(app_name);
    setShortcode(shortcode);
    setApiKeys(api_key);
    setPhone(phone);
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
      handleStepChange={handleStepChange}
      saveData={saveData}
    />
  );
};
