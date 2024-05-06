import { Input } from 'components/UI/Form/Input/Input';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { FormLayout } from '../FormLayout/FormLayout';
import { useState } from 'react';
import styles from '../FormLayout/FormLayout.module.css';
import { PaymentOptions } from '../PaymentType/PaymentOptions';
import { FormStepProps } from './OrgDetails';

export const PaymentDetails = ({ handleStepChange }: FormStepProps) => {
  const { t } = useTranslation();
  const [paymentType, setPaymentType] = useState<string>('yearly');
  const [name, setName] = useState<string>('');
  const [designation, setDesignation] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [email, setEmail] = useState<string>('');

  const FormSchema = Yup.object().shape({
    name: Yup.string().required(t('This Field is required.')),
    designation: Yup.string().required(t('This Field is required.')),
    phoneNumber: Yup.string()
      .required(t('This Field is required.'))
      .length(10, 'Enter a valid phone number.'),
    email: Yup.string().required(t('This Field is required.')).email('Enter a valid email.'),
  });
  const initialFormValues: any = { name, designation, phoneNumber, email };

  const formFields = [
    {
      label: 'Preferred billing frequency.',
      children: [
        {
          component: PaymentOptions,
          name: 'paymentOption',
          handleOnChange: (value: any) => setPaymentType(value),
          paymentType: paymentType,
        },
      ],
    },
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
      inputLabelSubtext: (
        <span className={styles.SubText}>(Invoice will be sent to this email)</span>
      ),
    },
  ];

  const setPayload = (payload: any) => {
    const object = {
      ...payload,
      paymentType: paymentType,
    };
    return object;
  };

  const setStates = (states: any) => {
    const { name, designation, phoneNumber, email, paymentType } = states;
    setName(name);
    setDesignation(designation);
    setPhoneNumber(phoneNumber);
    setEmail(email);
    setPaymentType(paymentType);
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
      identifier="payemntDetails"
      handleStepChange={handleStepChange}
    />
  );
};
