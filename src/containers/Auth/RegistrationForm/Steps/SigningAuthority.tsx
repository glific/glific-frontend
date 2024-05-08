import { Input } from 'components/UI/Form/Input/Input';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { FormLayout } from '../FormLayout/FormLayout';
import { useState } from 'react';
import { FormStepProps } from './OrgDetails';
import { ONBOARD_URL_UPDATE } from 'config';
import { Checkbox } from 'components/UI/Form/Checkbox/Checkbox';
import styles from '../FormLayout/FormLayout.module.css';
import { TermsAndConditions } from '../TermsAndConditions/TermsAndCondition';
import axios from 'axios';

export const SigningAuthority = ({
  handleStepChange,
  openReachOutToUs,
  saveData,
  setErrorOpen,
}: FormStepProps) => {
  const { t } = useTranslation();
  const [submitterName, setSubmitterName] = useState<string>('');
  const [submitterEmail, setSubmitterEmail] = useState<string>('');
  const [signingAuthorityName, setSigningAuthorityName] = useState<string>('');
  const [signingAuthorityDesignation, setSigningAuthorityDesignation] = useState<string>('');
  const [signingAuthorityEmail, setSigningAuthorityEmail] = useState<string>('');

  const [terms_agreed, setTermsAgreed] = useState<boolean>(false);
  const [support_staff_account, setSupportStaffAccount] = useState<boolean>(false);

  const [dialogOpen, setDialogOpen] = useState(false);

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
    terms_agreed: Yup.boolean().oneOf(
      [true],
      'Please agree to the terms and conditions or contact us   .'
    ),
    support_staff_account: Yup.boolean().oneOf(
      [true],
      'Please agree to creation or support staff account.'
    ),
  });

  const initialFormValues: any = {
    submitterName,
    submitterEmail,
    signingAuthorityName,
    signingAuthorityDesignation,
    signingAuthorityEmail,
    terms_agreed,
    support_staff_account,
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
      label: '',
      children: [
        {
          component: Checkbox,
          name: 'terms_agreed',
          title: (
            <span>
              I agree to{' '}
              <span className={styles.TermsAndConditions}>Glific Terms & conditions</span>
            </span>
          ),
          darkCheckbox: true,
          additionalStyles: styles.FullWidth,
        },
        {
          component: Checkbox,
          name: 'support_staff_account',
          title: 'I agree to let the Glific team create a support staff account on my Glific setup',
          additionalStyles: styles.FullWidth,
          darkCheckbox: true,
        },
      ],
    },
  ];

  const setPayload = (payload: any) => {
    const data = localStorage.getItem('registrationData');
    let registrationData;
    const {
      submitterName,
      submitterEmail,
      signingAuthorityName,
      signingAuthorityDesignation,
      terms_agreed,
      support_staff_account,
    } = payload;

    let updatedPayload = payload;
    if (data) {
      console.log(payload);

      registrationData = JSON.parse(data);
      updatedPayload = {
        finance_poc: {
          name: registrationData.payemntDetails.name,
          email: registrationData.payemntDetails.email,
          designation: registrationData.payemntDetails.designation,
          phone: registrationData.payemntDetails.phone,
        },
        submitter: {
          name: payload.submitterName,
          email: payload.submitterEmail,
        },
        signing_authority: {
          name: payload.signingAuthorityName,
          designation: payload.signingAuthorityDesignation,
          email: payload.signingAuthorityEmail,
        },
        has_submitted: true,
        billing_frequency: registrationData.payemntDetails.billing_frequency,
        terms_agreed: payload.terms_agreed,
        support_staff_account: payload.support_staff_account,
        ...registrationData.registration_details,
      };
    }

    return updatedPayload;
  };

  const setStates = (states: any) => {
    const {
      submitterName,
      submitterEmail,
      signingAuthorityName,
      signingAuthorityDesignation,
      signingAuthorityEmail,
      support_staff_account,
      terms_agreed,
    } = states;

    setSubmitterName(submitterName);
    setSubmitterEmail(submitterEmail);
    setSigningAuthorityName(signingAuthorityName);
    setSigningAuthorityDesignation(signingAuthorityDesignation);
    setSigningAuthorityEmail(signingAuthorityEmail);
    setTermsAgreed(terms_agreed);
    setSupportStaffAccount(support_staff_account);
  };

  const handleSubmit = async (payload: any) => {
    setLoading(true);
    await axios
      .post(ONBOARD_URL_UPDATE, payload, {
        headers: {
          'Content-Type': 'application/json ',
        },
      })
      .then(({ data }) => {
        setLoading(false);

        if (data.is_valid) {
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

  return (
    <>
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
      {dialogOpen && (
        <TermsAndConditions
          openReachOutToUs={openReachOutToUs}
          open={dialogOpen}
          setOpen={setDialogOpen}
          setTermsAgreed={setTermsAgreed}
        />
      )}
    </>
  );
};
