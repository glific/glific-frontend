import { useState } from 'react';
import * as Yup from 'yup';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import { ONBOARD_URL_UPDATE } from 'config';
import styles from '../FormLayout/FormLayout.module.css';
import { Input } from 'components/UI/Form/Input/Input';
import { PhoneInput } from 'components/UI/Form/PhoneInput/PhoneInput';
import { FormLayout } from '../FormLayout/FormLayout';
import { PaymentOptions } from '../PaymentType/PaymentOptions';
import { FormStepProps } from './OrgDetails';

export const PaymentDetails = ({ handleStepChange, saveData }: FormStepProps) => {
  const { t } = useTranslation();
  const [billing_frequency, setPaymentType] = useState<string>('yearly');
  const [name, setName] = useState<string>('');
  const [designation, setDesignation] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [formattedPhone, setFormattedPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');

  const [loading, setLoading] = useState(false);

  const FormSchema = Yup.object().shape({
    name: Yup.string()
      .required(t('Name is required.'))
      .max(25, t('Please enter not more than 25 characters')),
    designation: Yup.string()
      .required(t('Designation is required.'))
      .max(25, t('Please enter not more than 25 characters')),
    phone: Yup.string()
      .required(t('Phone number is required.'))
      .min(7, t('Enter a valid phone number.')),
    email: Yup.string().required(t('Email is required.')).email(t('Enter a valid email.')),
  });
  const initialFormValues: any = {
    name,
    designation,
    phone,
    email,
    billing_frequency,
  };

  const handlePhoneNumberChange = (_: any, data: any, formFieldItems: any) => {
    const formattedValue = formFieldItems.split(data.dialCode).join(data.dialCode + '-');
    setFormattedPhone(formattedValue);
  };

  const formFields = [
    {
      label: 'Preferred Billing Frequency',
      children: [
        {
          component: PaymentOptions,
          name: 'paymentOption',
          additionalStyles: styles.FullWidth,
        },
      ],
    },
    {
      label: 'Finance Team Details',
      children: [
        {
          component: Input,
          name: 'name',
          type: 'text',
          inputLabel: 'First Name',
        },
        {
          component: Input,
          name: 'designation',
          type: 'text',
          inputLabel: 'Designation',
        },
        {
          component: PhoneInput,
          name: 'phone',
          type: 'phone',
          inputLabel: 'Phone Number',
          changeHandler: handlePhoneNumberChange,
        },
        {
          component: Input,
          name: 'email',
          type: 'text',
          inputLabel: 'Email Address',
          helperText: (
            <span className={styles.FormHelperText}>Invoice will be sent to this email</span>
          ),
        },
      ],
    },
  ];

  const setPayload = (payload: any) => {
    const data = localStorage.getItem('registrationData');
    if (data) {
      let registrationData = JSON.parse(data);

      const updatedPayload = {
        finance_poc: {
          ...payload,
          phone: formattedPhone,
        },
        registration_id: registrationData.registration_details.registration_id,
        org_id: registrationData.registration_details.org_id,
        has_submitted: false,
        billing_frequency: payload.billing_frequency,
      };

      return updatedPayload;
    }
  };

  const setStates = (states: any) => {
    const { name, designation, phone, email, billing_frequency } = states.finance_poc;

    setName(name);
    setDesignation(designation);
    setPhone(phone);
    setFormattedPhone(phone);
    setEmail(email);
    setPaymentType(billing_frequency);
  };

  const handleSubmit = async (payload: any, setErrors: any) => {
    setLoading(true);

    await axios.post(ONBOARD_URL_UPDATE, payload).then(({ data }) => {
      setLoading(false);
      if (data.is_valid) {
        handleStepChange();
      } else {
        const errors = Object.keys(data.messages).reduce((acc, key) => {
          const newKey = key.replace('finance_poc_', '');
          return { ...acc, [newKey]: data.messages[key] };
        }, {});

        setErrors(errors);
      }
    });
  };

  return (
    <FormLayout
      validationSchema={FormSchema}
      formFieldItems={formFields}
      initialValues={initialFormValues}
      step={3}
      title="Billing"
      helperText="Select the billing frequency and enter the billing information"
      setStates={setStates}
      setPayload={setPayload}
      identifier="payemntDetails"
      handleStepChange={handleStepChange}
      saveData={saveData}
      submitData={handleSubmit}
      loading={loading}
    />
  );
};
