import { Input } from 'components/UI/Form/Input/Input';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { FormLayout } from '../FormLayout/FormLayout';
import { useState } from 'react';

export const PaymentDetails = () => {
  const { t } = useTranslation();
  const [name, setName] = useState<string>('');
  const [designation, setDesignation] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [email, setEmail] = useState<string>('');

  const FormSchema = Yup.object().shape({
    name: Yup.string().required(t('Input required')),
    designation: Yup.string().required(t('Input required')),
    phoneNumber: Yup.string().required(t('Input required')),
    email: Yup.string().required(t('Input required')),
  });
  const initialFormValues: any = { name, designation, phoneNumber, email };

  const formFields = [
    {
      component: Input,
      name: 'name',
      type: 'text',
      inputLabel: 'Name',
      placeholder: 'Enter full name.',
    },
    {
      component: Input,
      name: 'designation',
      type: 'text',
      inputLabel: 'Designation',
      placeholder: 'Enter the designation.',
    },
    {
      component: Input,
      name: 'phoneNumber',
      type: 'text',
      inputLabel: 'Phone Number',
      placeholder: 'Enter 10-digit phone number.',
    },
    {
      component: Input,
      name: 'email',
      type: 'text',
      inputLabel: 'Email address',
      placeholder: 'Enter your email address.',
    },
  ];

  const setPayload = (payload: any) => {
    let object: any = {};
    console.log(payload);

    return object;
  };

  const setStates = (states: any) => {
    const { name, designation, phoneNumber, email } = states;
    setName(name);
    setDesignation(designation);
    setPhoneNumber(phoneNumber);
    setEmail(email);
  };

  return (
    <FormLayout
      validationSchema={FormSchema}
      formFieldItems={formFields}
      initialValues={initialFormValues}
      step={3}
      title="Payment details"
      helperText="Add payment information and choose the billing frequency"
      setStates={setStates}
      setPayload={setPayload}
    />
  );
};
