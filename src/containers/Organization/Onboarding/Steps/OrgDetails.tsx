import { Input } from 'components/UI/Form/Input/Input';
import * as Yup from 'yup';
import { FormLayout } from '../FormLayout/FormLayout';
import { useState } from 'react';

import styles from '../FormLayout/FormLayout.module.css';
import { ONBOARD_URL_UPDATE } from 'config';
import axios from 'axios';
import { Checkbox } from '@mui/material';

export interface FormStepProps {
  handleStepChange: Function;
  saveData: Function;
}

export const OrgDetails = ({ handleStepChange, saveData }: FormStepProps) => {
  const [gstin, setGstNumber] = useState<string>('');
  const [registered_address, setRegisteredAddress] = useState<string>('');
  const [current_address, setCurrentAddress] = useState<string>('');

  const [loading, setLoading] = useState(false);

  const FormSchema = Yup.object().shape({
    gstin: Yup.string().length(15, 'Invalid gst number'),
    registered_address: Yup.string()
      .required('Registered address is required.')
      .max(300, 'Address should not exceed 300 characters'),
    current_address: Yup.string()
      .required('Current address is required.')
      .max(300, 'Address should not exceed 300 characters'),
  });

  const initialFormValues: any = {
    gstin,
    registered_address,
    current_address,
  };

  const inputendAdornment = (formik: any) => {
    return (
      <div className={styles.Checkbox}>
        <Checkbox
          data-testid="checkboxLabel"
          color="primary"
          checked={
            formik.values.registered_address &&
            formik.values.current_address === formik.values.registered_address
          }
          onChange={(event) => {
            if (event.target.checked) {
              formik.setFieldValue('current_address', formik.values.registered_address);
            } else {
              formik.setFieldValue('current_address', '');
            }
          }}
        />
        <p className={styles.CheckboxLabel}>Same as registered address</p>
      </div>
    );
  };

  const formFields = [
    {
      component: Input,
      name: 'registered_address',
      type: 'text',
      inputLabel: 'Registered address',
      textArea: true,
      inputLabelSubtext: <span className={styles.SubText}>(As per your documentation)</span>,
      additionalStyles: styles.MessageField,
    },
    {
      component: Input,
      name: 'current_address',
      type: 'text',
      inputLabel: 'Current address',
      textArea: true,
      additionalStyles: styles.MessageField,
      fieldEndAdornment: { show: true, component: inputendAdornment },
    },
    {
      component: Input,
      name: 'gstin',
      type: 'text',
      inputLabel: 'GSTIN number',
      helperText: 'Enter the 15 digit code',
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
      step={2}
      title="Organization details"
      helperText="To be filled by the signing authority of your organization."
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
