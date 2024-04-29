import { Input } from '@mui/material';
import { useTranslation } from 'react-i18next';
import PhoneInput from 'react-phone-input-2';
import { FormLayout } from './FormLayout/FormLayout';
import { yupPasswordValidation } from 'common/constants';
import * as Yup from 'yup';

export const Form = () => {
  const { t } = useTranslation();

  const FormSchema = Yup.object().shape({
    name: Yup.string().required(t('Input required')),
    phone: Yup.string().required(t('Input required')),
    password: yupPasswordValidation(t),
  });
  const initialFormValues: any = { name: '', phone: '', password: '', captcha: '' };

  const formFields = [
    {
      component: Input,
      name: 'name',
      type: 'text',
      placeholder: t('Your full name'),
      darkMode: true,
    },
    {
      component: PhoneInput,
      name: 'phone',
      type: 'phone',
      placeholder: t('Your personal WhatsApp number'),
      helperText: t('Please enter a phone number.'),
    },
    {
      component: Input,
      name: 'password',
      type: 'password',
      placeholder: t('Password'),
      darkMode: true,
    },
  ];
  return (
    <div>
      <FormLayout
        validationSchema={FormSchema}
        formFieldItems={formFields}
        initialValues={initialFormValues}
        step={1}
        title="About the Organization"
        helperText="Note : To be filled by the signing authority of your organization"
      />
    </div>
  );
};
