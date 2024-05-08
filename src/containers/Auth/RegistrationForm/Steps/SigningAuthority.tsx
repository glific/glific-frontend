import { Input } from 'components/UI/Form/Input/Input';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { FormLayout } from '../FormLayout/FormLayout';
import { useState } from 'react';
import { FormStepProps } from './OrgDetails';
import { ONBOARD_URL_UPDATE } from 'config';
import styles from '../FormLayout/FormLayout.module.css';
import { TermsAndConditions } from '../TermsAndConditions/TermsAndCondition';
import axios from 'axios';

export const SigningAuthority = ({
  handleStepChange,
  openReachOutToUs,
  saveData,
}: FormStepProps) => {
  const { t } = useTranslation();
  const [submitterName, setSubmitterName] = useState<string>('');
  const [submitterEmail, setSubmitterEmail] = useState<string>('');
  const [signingAuthorityName, setSigningAuthorityName] = useState<string>('');
  const [signingAuthorityDesignation, setSigningAuthorityDesignation] = useState<string>('');
  const [signingAuthorityEmail, setSigningAuthorityEmail] = useState<string>('');

  const [permissions, setPermissions] = useState({
    terms_agreed: false,
    support_staff_account: false,
  });

  const [loading, setLoading] = useState(false);

  const FormSchema = Yup.object().shape({
    submitterName: Yup.string().required(t('This Field is required.')),
    submitterEmail: Yup.string()
      .required(t('This Field is required.'))
      .email('Enter a valid email.'),
    signingAuthorityName: Yup.string().required(t('This Field is required.')),
    signingAuthorityDesignation: Yup.string().required(t('This Field is required.')),
    signingAuthorityEmail: Yup.string()
      .required(t('This Field is required.'))
      .email('Enter a valid email.'),
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
      label: 'SUBMITTER DETAILS',
      children: [
        {
          component: Input,
          name: 'submitterName',
          type: 'text',
          inputLabel: 'Name',
          placeholder: 'Enter full name.',
        },
        {
          component: Input,
          name: 'submitterEmail',
          type: 'text',
          inputLabel: 'Email address',
          placeholder: 'Enter your email address.',
        },
      ],
    },
    {
      label: 'SIGNING AUTHORITY DETAILS',
      children: [
        {
          component: Input,
          name: 'signingAuthorityName',
          type: 'text',
          inputLabel: 'Name',
          placeholder: 'Enter full name.',
        },
        {
          component: Input,
          name: 'signingAuthorityDesignation',
          type: 'text',
          inputLabel: 'Designation',
          placeholder: 'Enter your designation',
        },
        {
          component: Input,
          name: 'signingAuthorityEmail',
          type: 'text',
          inputLabel: 'Email address',
          placeholder: 'Enter your email address.',
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
    const {
      submitterName,
      submitterEmail,
      signingAuthorityName,
      signingAuthorityDesignation,
      signingAuthorityEmail,
      permissions,
    } = states;

    setSubmitterName(submitterName);
    setSubmitterEmail(submitterEmail);
    setSigningAuthorityName(signingAuthorityName);
    setSigningAuthorityDesignation(signingAuthorityDesignation);
    setSigningAuthorityEmail(signingAuthorityEmail);
    setPermissions(permissions);
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
      title="Submitter & Signing authority details"
      helperText="Details and information of the applicant and concerned signing authority of the organization"
      setStates={setStates}
      setPayload={setPayload}
      identifier="submitterDetails"
      handleStepChange={handleStepChange}
      saveData={saveData}
      loading={loading}
      submitData={handleSubmit}
    />
  );
};
