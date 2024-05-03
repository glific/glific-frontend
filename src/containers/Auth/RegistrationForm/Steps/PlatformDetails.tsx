import { Input } from 'components/UI/Form/Input/Input';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { PhoneInput } from 'components/UI/Form/PhoneInput/PhoneInput';
import { FormLayout } from '../FormLayout/FormLayout';
import { useState } from 'react';

export const PlatformDetails = () => {
  const { t } = useTranslation();
  const [appName, setAppName] = useState<string>('');
  const [apiKeys, setApiKeys] = useState<string>('');
  const [shortcode, setShortcode] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');

  const FormSchema = Yup.object().shape({
    appName: Yup.string().required(t('Input required')),
    apiKeys: Yup.string().required(t('Input required')),
    shortcode: Yup.string().required(t('Input required')),
    phoneNumber: Yup.string(),
  });
  const initialFormValues: any = { appName, apiKeys, shortcode, phoneNumber };

  const formFields = [
    // {
    //   component: Input,
    //   name: 'chatBotNumber',
    //   type: 'number',
    //   placeholder: 'New whatsapp chatbot number',
    //   inputLabel: 'Chatbot number',
    // },
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
      helperText: 'Name of your bot on Gupshup. Find it here',
    },
    {
      component: Input,
      name: 'apiKeys',
      type: 'text',
      inputLabel: 'Gupshup API keys',
      placeholder: 'Enter the api keys',
      helperText: 'Click here to get the API keys',
    },
    {
      component: Input,
      name: 'shortcode',
      type: 'text',
      inputLabel: 'URL shortcode',
      placeholder: 'Atleast 7-8 characters',
      helperText: 'Name you want to give your Glific platform',
    },
  ];

  const setPayload = (payload: any) => {
    let object: any = {};
    console.log(payload);

    return object;
  };

  const setStates = (states: any) => {
    const { appName, shortcode, apiKeys, phoneNumber } = states;
    setAppName(appName);
    setShortcode(shortcode);
    setApiKeys(apiKeys);
    setPhoneNumber(phoneNumber);
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
    />
  );
};
