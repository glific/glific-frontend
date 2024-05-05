import { Input } from 'components/UI/Form/Input/Input';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { FormLayout } from '../FormLayout/FormLayout';
import { useState } from 'react';

import styles from '../FormLayout/FormLayout.module.css';

export const OrgDetails = () => {
  const { t } = useTranslation();
  const [orgName, setOrgName] = useState<string>('');
  const [gstNumber, setGstNumber] = useState<string>('');
  const [registeredAddress, setRegisteredAddress] = useState<string>('');
  const [currentAddress, setCurrentAddress] = useState<string>('');

  const FormSchema = Yup.object().shape({
    orgName: Yup.string().required(t('This Field is required.')).max(40),
    gstNumber: Yup.string().required(t('This Field is required.')).length(15, 'Invalid gst number'),
    registeredAddress: Yup.string().required(t('This Field is required.')).max(300),
    currentAddress: Yup.string().required(t('This Field is required.')).max(300),
  });

  const initialFormValues: any = { orgName, gstNumber, registeredAddress, currentAddress };

  const formFields = [
    {
      component: Input,
      name: 'orgName',
      type: 'text',
      inputLabel: 'Organization registered name',
      placeholder: 'Enter the organization name.',
    },
    {
      component: Input,
      name: 'gstNumber',
      type: 'text',
      inputLabel: 'GSTIN number',
      placeholder: 'Enter the 15 digit code.',
      inputLabelSubtext: <span className={styles.SubText}>(optional)</span>,
    },
    {
      component: Input,
      name: 'registeredAddress',
      type: 'text',
      inputLabel: 'Registered address',
      placeholder: 'Enter the organization’s registered address.',
      textArea: true,
      inputLabelSubtext: <span className={styles.SubText}>(As per your documentation)</span>,
    },
    {
      component: Input,
      name: 'currentAddress',
      type: 'text',
      inputLabel: 'Current address',
      placeholder: 'Enter the organization’s current address.',
      textArea: true,
    },
  ];

  const setPayload = (payload: any) => {
    return payload;
  };

  const setStates = (states: any) => {
    const { orgName, gstNumber, registeredAddress, currentAddress } = states;
    setOrgName(orgName);
    setGstNumber(gstNumber);
    setRegisteredAddress(registeredAddress);
    setCurrentAddress(currentAddress);
  };

  return (
    <FormLayout
      validationSchema={FormSchema}
      formFieldItems={formFields}
      initialValues={initialFormValues}
      step={2}
      title="About the organization"
      helperText="Note : To be filled by the signing authority of your organization."
      setStates={setStates}
      setPayload={setPayload}
    />
  );
};
