import { Input } from 'components/UI/Form/Input/Input';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { FormLayout } from '../FormLayout/FormLayout';
import { useState } from 'react';

export const OrgDetails = () => {
  const { t } = useTranslation();
  const [orgName, setOrgName] = useState<string>('');
  const [gstNumber, setGstNumber] = useState<string>('');
  const [registeredAddress, setRegisteredAddress] = useState<string>('');
  const [currentAddress, setCurrentAddress] = useState<string>('');

  const FormSchema = Yup.object().shape({
    orgName: Yup.string().required(t('Input required')),
    gstNumber: Yup.string().required(t('Input required')),
    registeredAddress: Yup.string().required(t('Input required')),
    currentAddress: Yup.string().required(t('Input required')),
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
      inputLabel: 'GSTIN number (optional)',
      placeholder: 'Enter the 15 digit code.',
    },
    {
      component: Input,
      name: 'registeredAddress',
      type: 'text',
      inputLabel: 'Registered address (As per your documentation)',
      placeholder: 'Enter the organization’s registered address.',
      textArea: true,
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
    let object: any = {};
    console.log(payload);

    return object;
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
