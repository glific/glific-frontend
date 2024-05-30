import { useState } from 'react';
import * as Yup from 'yup';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import { ONBOARD_URL_UPDATE } from 'config';
import styles from '../FormLayout/FormLayout.module.css';
import { Input } from 'components/UI/Form/Input/Input';
import { FormLayout } from '../FormLayout/FormLayout';
import { FormStepProps } from './OrgDetails';
import { TermsAndConditions } from '../TermsAndConditions/TermsAndCondition';

interface SigningAuthorityProps extends FormStepProps {
  openReachOutToUs?: Function;
}

export const SigningAuthority = ({
  handleStepChange,
  openReachOutToUs,
  saveData,
}: SigningAuthorityProps) => {
  const { t } = useTranslation();
  const [submitterName, setSubmitterName] = useState<string>('');
  const [submitterEmail, setSubmitterEmail] = useState<string>('');
  const [signingAuthorityName, setSigningAuthorityName] = useState<string>('');
  const [signingAuthorityDesignation, setSigningAuthorityDesignation] = useState<string>('');
  const [signingAuthorityEmail, setSigningAuthorityEmail] = useState<string>('');

  const [permissions, setPermissions] = useState({
    terms_agreed: false,
    support_staff_account: true,
  });

  const [loading, setLoading] = useState(false);

  const FormSchema = Yup.object().shape({
    submitterName: Yup.string()
      .required(t('Name is required.'))
      .max(25, t('Please enter not more than 25 characters')),
    submitterEmail: Yup.string().required(t('Email is required.')).email(t('Enter a valid email.')),
    signingAuthorityName: Yup.string()
      .required(t('Name is required.'))
      .max(25, t('Please enter not more than 25 characters')),

    signingAuthorityDesignation: Yup.string().required('Designation is required.'),
    signingAuthorityEmail: Yup.string()
      .required(t('Email is required.'))
      .email('Enter a valid email.'),
    permissions: Yup.object({
      terms_agreed: Yup.boolean()
        .oneOf([true], 'Please agree to the terms and conditions.')
        .required('Please agree to the terms and conditions.'),
      support_staff_account: Yup.boolean()
        .oneOf([true], 'Please agree to the creation of staff account.')
        .required('Please agree to the creation of staff account.'),
    }),
  });

  const initialFormValues: any = {
    submitterName,
    submitterEmail,
    signingAuthorityName,
    signingAuthorityDesignation,
    signingAuthorityEmail,
    permissions,
  };

  const formFields = [
    {
      label: 'Your Details',
      children: [
        {
          component: Input,
          name: 'submitterName',
          type: 'text',
          inputLabel: 'Name',
        },
        {
          component: Input,
          name: 'submitterEmail',
          type: 'text',
          inputLabel: 'Email Address',
        },
      ],
    },
    {
      label: 'Signing Authority',
      children: [
        {
          component: Input,
          name: 'signingAuthorityName',
          type: 'text',
          inputLabel: 'Name',
        },
        {
          component: Input,
          name: 'signingAuthorityDesignation',
          type: 'text',
          inputLabel: 'Designation',
        },
        {
          component: Input,
          name: 'signingAuthorityEmail',
          type: 'text',
          inputLabel: 'Email Address',
        },
      ],
    },
    {
      component: TermsAndConditions,
      openReachOutToUs: openReachOutToUs,
      name: 'permissions',
      additionalStyles: styles.FullWidth,
    },
  ];

  const setPayload = (payload: any) => {
    const data = localStorage.getItem('registrationData');
    if (data) {
      let registrationData = JSON.parse(data);

      const updatedPayload = {
        submitter: {
          name: payload.submitterName,
          email: payload.submitterEmail,
        },
        signing_authority: {
          name: payload.signingAuthorityName,
          designation: payload.signingAuthorityDesignation,
          email: payload.signingAuthorityEmail,
        },
        terms_agreed: payload.permissions.terms_agreed,
        support_staff_account: payload.permissions.support_staff_account,
        registration_id: registrationData.registration_details.registration_id,
        org_id: registrationData.registration_details.org_id,

        has_submitted: true,
      };

      return updatedPayload;
    }
  };

  const setStates = (states: any) => {
    const { signing_authority, submitter } = states;

    setSubmitterName(submitter?.name);
    setSubmitterEmail(submitter?.email);
    setSigningAuthorityName(signing_authority?.name);
    setSigningAuthorityDesignation(signing_authority?.designation);
    setSigningAuthorityEmail(signing_authority?.email);
    setPermissions({ support_staff_account: false, terms_agreed: false });
  };

  const handleSubmit = async (payload: any, setErrors: any) => {
    setLoading(true);

    await axios.post(ONBOARD_URL_UPDATE, payload).then(({ data }) => {
      setLoading(false);
      if (data.is_valid) {
        handleStepChange();
        localStorage.removeItem('registrationData');
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
      step={4}
      title="Confirmation"
      helperText="Applicant and the Signing Authority details for the organization"
      setStates={setStates}
      setPayload={setPayload}
      identifier="submitterDetails"
      handleStepChange={handleStepChange}
      saveData={saveData}
      loading={loading}
      submitData={handleSubmit}
      buttonState={{ text: 'Submit' }}
    />
  );
};
