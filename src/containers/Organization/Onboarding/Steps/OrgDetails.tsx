import { useState } from 'react';
import axios from 'axios';
import { Checkbox } from '@mui/material';
import * as Yup from 'yup';

import { ONBOARD_URL_UPDATE } from 'config';
import styles from '../FormLayout/FormLayout.module.css';
import { Input } from 'components/UI/Form/Input/Input';
import { FormLayout } from '../FormLayout/FormLayout';
import { useTranslation } from 'react-i18next';
import { RegisteredAddress } from './Address/Address';

export interface FormStepProps {
  handleStepChange: Function;
  saveData: Function;
}

const isSameAddress = (address1: any, address2: any) =>
  Object.keys(address1).every((key) => address1[key] === address2[key]);

export const OrgDetails = ({ handleStepChange, saveData }: FormStepProps) => {
  const [gstin, setGstNumber] = useState<string>('');
  const [registered_address, setRegisteredAddress] = useState({
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
  });
  const [current_address, setCurrentAddress] = useState({
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
  });
  const [same_address, setSameAddress] = useState(false);
  const [disable, setDisable] = useState(false);

  const [loading, setLoading] = useState(false);
  const [customError, setCustomError] = useState(null);

  const { t } = useTranslation();

  const FormSchema = Yup.object().shape({
    gstin: Yup.string().length(15, t('Invalid gst number')),
    registered_address: Yup.object().shape({
      address_line1: Yup.string().required('Address Line 1 is required'),
      address_line2: Yup.string(),
      city: Yup.string().required('City is required'),
      state: Yup.string().required('State is required'),
      country: Yup.string().required('Country is required'),
      pincode: Yup.string().matches(/^\d+$/, 'Invalid Pincode').required('Pincode is required'),
    }),
    current_address: Yup.object().shape({
      address_line1: Yup.string().required('Address Line 1 is required'),
      address_line2: Yup.string(),
      city: Yup.string().required('City is required'),
      state: Yup.string().required('State is required'),
      country: Yup.string().required('Country is required'),
      pincode: Yup.string().matches(/^\d+$/, 'Invalid Pincode').required('Pincode is required'),
    }),
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
      component: RegisteredAddress,
      name: 'registered_address',
      inputLabelSubtext: <span className={styles.SubText}>(As per your documentation)</span>,
      inputLabel: 'Registered Address',
      address: registered_address,
      setAddress: setRegisteredAddress,
    },
    {
      component: RegisteredAddress,
      name: 'current_address',
      inputLabel: 'Current Address',
      additionalStyles: styles.MessageField,
      fieldEndAdornment: { show: true, component: inputendAdornment },
      disabled: disable,
      address: current_address,
      setAddress: setCurrentAddress,
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
    if (isSameAddress(registered_address, current_address)) {
      setSameAddress(true);
      setDisable(true);
    }
  };

  const handleSubmit = async (payload: any, setErrors: any) => {
    setLoading(true);
    await axios
      .post(ONBOARD_URL_UPDATE, payload)
      .then(({ data }) => {
        setLoading(false);
        if (data.is_valid) {
          handleStepChange();
        } else {
          setErrors(data.messages);
        }
      })
      .catch((data) => {
        if (data?.response?.data?.error?.message) {
          setCustomError(data?.response?.data?.error?.message);
        }
        setLoading(false);
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
      title="Organization"
      helperText="Please fill your organization details."
      setStates={setStates}
      setPayload={setPayload}
      identifier="orgDetails"
      handleStepChange={handleStepChange}
      saveData={saveData}
      submitData={handleSubmit}
      loading={loading}
      handleEffect={handleAutoUpdateAddress}
      setCustomError={setCustomError}
      customError={customError}
    />
  );
};
