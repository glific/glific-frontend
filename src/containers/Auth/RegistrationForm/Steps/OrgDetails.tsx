import { Input } from 'components/UI/Form/Input/Input';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { FormLayout } from '../FormLayout/FormLayout';
import { useState } from 'react';

import styles from '../FormLayout/FormLayout.module.css';
import { ONBOARD_URL_UPDATE } from 'config';
import axios from 'axios';

export interface FormStepProps {
  handleStepChange: Function;
  openReachOutToUs?: Function;
  saveData: Function;
}

export const OrgDetails = ({ handleStepChange, saveData }: FormStepProps) => {
  const { t } = useTranslation();
  const [gstin, setGstNumber] = useState<string>('');
  const [registered_address, setRegisteredAddress] = useState<string>('');
  const [current_address, setCurrentAddress] = useState<string>('');

  const [loading, setLoading] = useState(false);

  const FormSchema = Yup.object().shape({
    gstin: Yup.string().length(15, 'Invalid gst number'),
    registered_address: Yup.string().required(t('This Field is required.')).max(300),
    current_address: Yup.string().required(t('This Field is required.')).max(300),
  });

  const initialFormValues: any = {
    gstin,
    registered_address,
    current_address,
  };

  const formFields = [
    {
      component: Input,
      name: 'registered_address',
      type: 'text',
      inputLabel: 'Registered address',
      placeholder: 'Enter the organization’s registered address.',
      textArea: true,
      inputLabelSubtext: <span className={styles.SubText}>(As per your documentation)</span>,
      additionalStyles: styles.MessageField,
    },
    {
      component: Input,
      name: 'current_address',
      type: 'text',
      inputLabel: 'Current address',
      placeholder: 'Enter the organization’s current address.',
      textArea: true,
      additionalStyles: styles.MessageField,
    },
    {
      component: Input,
      name: 'gstin',
      type: 'text',
      inputLabel: 'GSTIN number',
      placeholder: 'Enter the 15 digit code.',
      inputLabelSubtext: <span className={styles.SubText}>(optional)</span>,
    },
  ];

  const setPayload = (payload: any) => {
    const { gstin, registered_address, current_address } = payload;
    const data = localStorage.getItem('registrationData');
    if (data) {
      let registrationData = JSON.parse(data);

      const updatedPayload = {
        org_details: {
          gstin,
          registered_address,
          current_address,
        },
        registration_id: registrationData.registration_details.registration_id,
        org_id: registrationData.registration_details.org_id,
        has_submitted: false,
      };

      return updatedPayload;
    }
  };

  const setStates = (states: any) => {
    const { gstin, registered_address, current_address } = states.org_details;
    setGstNumber(gstin);
    setRegisteredAddress(registered_address);
    setCurrentAddress(current_address);
  };

  const handleSubmit = async (payload: any, setErrors: any) => {
    setLoading(true);
    await axios
      .post(ONBOARD_URL_UPDATE, payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then(({ data }) => {
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
      step={2}
      title="About the organization"
      helperText="Note : To be filled by the signing authority of your organization."
      setStates={setStates}
      setPayload={setPayload}
      identifier="orgDetails"
      handleStepChange={handleStepChange}
      saveData={saveData}
      submitData={handleSubmit}
      loading={loading}
    />
  );
};
