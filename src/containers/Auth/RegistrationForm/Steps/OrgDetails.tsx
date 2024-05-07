import { Input } from 'components/UI/Form/Input/Input';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { FormLayout } from '../FormLayout/FormLayout';
import { useState } from 'react';

import styles from '../FormLayout/FormLayout.module.css';
import { UploadDocument } from '../UploadDocument/UploadDocument';
import { ONBOARD_URL_SETUP } from 'config';
import axios from 'axios';

export interface FormStepProps {
  handleStepChange: Function;
  openReachOutToUs?: Function;
  setErrorOpen?: Function;
  saveData: Function;
}

export const OrgDetails = ({ handleStepChange, setErrorOpen, saveData }: FormStepProps) => {
  const { t } = useTranslation();
  const [name, setOrgName] = useState<string>('');
  const [gstin, setGstNumber] = useState<string>('');
  const [registered_address, setRegisteredAddress] = useState<string>('');
  const [current_address, setCurrentAddress] = useState<string>('');
  const [token, setToken] = useState(null);

  const [loading, setLoading] = useState(false);

  const FormSchema = Yup.object().shape({
    name: Yup.string().required(t('This Field is required.')).max(40),
    gstin: Yup.string().length(15, 'Invalid gst number'),
    registered_address: Yup.string().required(t('This Field is required.')).max(300),
    current_address: Yup.string().required(t('This Field is required.')).max(300),
    registration_doc: Yup.mixed().required(t('This Field is required.')),
  });

  const initialFormValues: any = {
    name,
    gstin,
    registered_address,
    current_address,
    token,
  };

  const formFields = [
    {
      component: Input,
      name: 'name',
      type: 'text',
      inputLabel: 'Organization registered name',
      placeholder: 'Enter the organization name.',
    },
    {
      component: Input,
      name: 'gstin',
      type: 'text',
      inputLabel: 'GSTIN number',
      placeholder: 'Enter the 15 digit code.',
      inputLabelSubtext: <span className={styles.SubText}>(optional)</span>,
    },
    {
      component: Input,
      name: 'registered_address',
      type: 'text',
      inputLabel: 'Registered address',
      placeholder: 'Enter the organization’s registered address.',
      textArea: true,
      inputLabelSubtext: <span className={styles.SubText}>(As per your documentation)</span>,
    },
    {
      component: Input,
      name: 'current_address',
      type: 'text',
      inputLabel: 'Current address',
      placeholder: 'Enter the organization’s current address.',
      textArea: true,
    },
    {
      component: UploadDocument,
      name: 'orgDocs',
      inputLabel: 'Registration document / certificate (PDF/PNG/JPEG)',
      additionalStyles: styles.FullWidth,
      helperText: 'Maximum file size upload limit : 20MB',
    },
  ];

  const setPayload = (payload: any) => {
    let updatedPayload = payload;

    const registrationData = localStorage.getItem('registrationData');
    if (registrationData) {
      const data = JSON.parse(registrationData);
      updatedPayload = {
        ...data.platformDetails,
        ...payload,
      };
    }

    return updatedPayload;
  };

  const handleSubmit = async (payload: any) => {
    setLoading(true);
    await axios
      .post(ONBOARD_URL_SETUP, payload, {
        headers: {
          'Content-Type': 'multipart/form-data ',
        },
      })
      .then(({ data }) => {
        setLoading(false);

        if (data.is_valid) {
          saveData(
            { registration_id: data.registration_id, org_id: data.organization.id },
            'registration_details'
          );

          return data;
        } else {
          const errors = Object.keys(data.messages).map((key) => {
            return data.messages[key];
          });

          if (setErrorOpen) setErrorOpen(errors);

          saveData(data.messages, 'errors');
        }
      });
  };

  const setStates = (states: any) => {
    const { name, gstin, registered_address, current_address } = states;
    setOrgName(name);
    setGstNumber(gstin);
    setRegisteredAddress(registered_address);
    setCurrentAddress(current_address);
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
      apiUrl={ONBOARD_URL_SETUP}
      headers={{ 'Content-Type': 'multipart/form-data' }}
      identifier="orgDetails"
      handleStepChange={handleStepChange}
      setErrorOpen={setErrorOpen}
      submitData={handleSubmit}
      saveData={saveData}
    />
  );
};
