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
  const [email, setEmail] = useState<string>('');

  const [loading, setLoading] = useState(false);

  const FormSchema = Yup.object().shape({
    name: Yup.string()
      .required(t('Name is required.'))
      .max(25, t('Please enter not more than 25 characters')),
    designation: Yup.string().required(t('Designation is required.')),
    phone: Yup.string().required(t('Phone number is required.')),
    email: Yup.string().required(t('Email is required.')).email(t('Enter a valid email.')),
  });
  const initialFormValues: any = { name, designation, phone, email, billing_frequency };

  const formFields = [
    {
      label: 'Preferred billing frequency.',
      children: [
        {
          component: PaymentOptions,
          name: 'paymentOption',
          additionalStyles: styles.FullWidth,
        },
      ],
    },
    {
      label: 'Point of Contact',
      children: [
        {
          component: Input,
          name: 'name',
          type: 'text',
          inputLabel: 'Name',
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
        },
        {
          component: Input,
          name: 'email',
          type: 'text',
          inputLabel: 'Email address',
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
        setErrors(data.messages);
      }
    });
  };

  return (
    <FormLayout
      validationSchema={FormSchema}
      formFieldItems={formFields}
      initialValues={initialFormValues}
      step={3}
      title="Payment details"
      helperText="Enter payment information and choose the billing frequency"
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
