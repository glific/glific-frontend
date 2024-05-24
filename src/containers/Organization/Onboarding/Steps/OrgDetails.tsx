import { useState } from 'react';
import axios from 'axios';
import { Checkbox } from '@mui/material';
import * as Yup from 'yup';

import { ONBOARD_URL_UPDATE } from 'config';
import styles from '../FormLayout/FormLayout.module.css';
import { Input } from 'components/UI/Form/Input/Input';
import { FormLayout } from '../FormLayout/FormLayout';
import { useTranslation } from 'react-i18next';

export interface FormStepProps {
  handleStepChange: Function;
  saveData: Function;
}

export const OrgDetails = ({ handleStepChange, saveData }: FormStepProps) => {
  const [gstin, setGstNumber] = useState<string>('');
  const [registered_address, setRegisteredAddress] = useState<string>('');
  const [current_address, setCurrentAddress] = useState<string>('');
  const [same_address, setSameAddress] = useState(false);
  const [disable, setDisable] = useState(false);

  const [loading, setLoading] = useState(false);

  const { t } = useTranslation();

  const FormSchema = Yup.object().shape({
    gstin: Yup.string().length(15, t('Invalid gst number')),
    registered_address: Yup.string()
      .required(t('Registered address is required.'))
      .max(300, t('Address should not exceed 300 characters')),
    current_address: Yup.string()
      .required(t('Current address is required.'))
      .max(300, t('Address should not exceed 300 characters')),
  });

  const initialFormValues: any = {
    gstin,
    registered_address,
    current_address,
    same_address,
  };

  const inputendAdornment = (formik: any) => {
    return (
      <div className={styles.Checkbox}>
        <Checkbox
          data-testid="checkboxLabel"
          color="primary"
          checked={formik.values.same_address}
          onChange={(event) => {
            formik.setFieldValue('same_address', event.target.checked);
            setDisable(event.target.checked);
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
      inputLabel: 'Registered Address',
      textArea: true,
      inputLabelSubtext: <span className={styles.SubText}>(As per your documentation)</span>,
      additionalStyles: styles.MessageField,
    },
    {
      component: Input,
      name: 'current_address',
      type: 'text',
      inputLabel: 'Current Address',
      textArea: true,
      additionalStyles: styles.MessageField,
      fieldEndAdornment: { show: true, component: inputendAdornment },
      disabled: disable,
    },
    {
      component: Input,
      name: 'gstin',
      type: 'text',
      inputLabel: 'GSTIN Number',
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
    if (current_address === registered_address) {
      setSameAddress(true);
    }
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

  const handleAutoUpdateAddress = (identifier: string, formik: any) => {
    if (identifier === 'orgDetails') {
      const { same_address, registered_address } = formik.values;
      if (same_address) {
        formik.setFieldValue('current_address', registered_address);
      }
    }
  };

  return (
    <FormLayout
      validationSchema={FormSchema}
      formFieldItems={formFields}
      initialValues={initialFormValues}
      step={2}
      title="Organization Details"
      helperText="Please fill your organization details."
      setStates={setStates}
      setPayload={setPayload}
      identifier="orgDetails"
      handleStepChange={handleStepChange}
      saveData={saveData}
      submitData={handleSubmit}
      loading={loading}
      handleEffect={handleAutoUpdateAddress}
    />
  );
};
