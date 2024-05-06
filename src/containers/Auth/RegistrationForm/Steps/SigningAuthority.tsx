import { Input } from 'components/UI/Form/Input/Input';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { FormLayout } from '../FormLayout/FormLayout';
import { useState } from 'react';
import { FormStepProps } from './OrgDetails';

export const SigningAuthority = ({ handleStepChange }: FormStepProps) => {
  const { t } = useTranslation();
  const [submitterName, setSubmitterName] = useState<string>('');
  const [submitterEmail, setSubmitterEmail] = useState<string>('');
  const [signingAuthorityName, setSigningAuthorityName] = useState<string>('');
  const [signingAuthorityDesignation, setSigningAuthorityDesignation] = useState<string>('');
  const [signingAuthorityEmail, setSigningAuthorityEmail] = useState<string>('');

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
  ];

  const setPayload = (payload: any) => {
    return payload;
  };

  const setStates = (states: any) => {
    console.log(states);
    const {
      submitterName,
      submitterEmail,
      signingAuthorityName,
      signingAuthorityDesignation,
      signingAuthorityEmail,
    } = states;

    setSubmitterName(submitterName);
    setSubmitterEmail(submitterEmail);
    setSigningAuthorityName(signingAuthorityName);
    setSigningAuthorityDesignation(signingAuthorityDesignation);
    setSigningAuthorityEmail(signingAuthorityEmail);
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
    />
  );
};
