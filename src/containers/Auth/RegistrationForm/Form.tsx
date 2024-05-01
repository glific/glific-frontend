import { Input } from 'components/UI/Form/Input/Input';
import { useTranslation } from 'react-i18next';
import { FormLayout } from './FormLayout/FormLayout';
import { yupPasswordValidation } from 'common/constants';
import * as Yup from 'yup';
import { PhoneInput } from 'components/UI/Form/PhoneInput/PhoneInput';

export const Form = () => {
  const { t } = useTranslation();

  const FormSchema = Yup.object().shape({
    name: Yup.string().required(t('Input required')),
    phone: Yup.string().required(t('Input required')),
    password: yupPasswordValidation(t),
  });
  const initialFormValues: any = { name: '', phone: '', password: '', captcha: '' };

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
      name: 'apiKeys',
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

  const States = {
    name: '',
  };

  const setStates = (states: any) => {
    console.log(states);
  };

  return (
    <div>
      <FormLayout
        validationSchema={FormSchema}
        formFieldItems={formFields}
        initialValues={initialFormValues}
        step={1}
        title="About the Organization"
        helperText="Note : To be filled by the signing authority of your organization"
        states={States}
        setStates={setStates}
        setPayload={setPayload}
      />
    </div>
  );
};
