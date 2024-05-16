import { useEffect, useState } from 'react';
import { Input } from 'components/UI/Form/Input/Input';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import * as Yup from 'yup';

import { ONBOARD_URL_SETUP } from 'config';
import styles from '../FormLayout/FormLayout.module.css';
import { PhoneInput } from 'components/UI/Form/PhoneInput/PhoneInput';
import { FormLayout } from '../FormLayout/FormLayout';
import { FormStepProps } from './OrgDetails';
import Tooltip from 'components/UI/Tooltip/Tooltip';
import InfoIcon from 'assets/images/info.svg?react';

export const PlatformDetails = ({ handleStepChange, saveData }: FormStepProps) => {
  const { t } = useTranslation();
  const [name, setOrgName] = useState<string>('');
  const [app_name, setAppName] = useState<string>('');
  const [api_key, setApiKeys] = useState<string>('');
  const [shortcode, setShortcode] = useState<string>('');
  const [phone, setPhone] = useState<string>('');

  const [isDisabled, setIsDisabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const FormSchema = Yup.object().shape({
    name: Yup.string()
      .required(t('Name is required.'))
      .max(40, t('Name should not exceed 40 characters')),
    app_name: Yup.string().required(t('App name is required.')),
    api_key: Yup.string().required(t('API key is required.')),
    shortcode: Yup.string().required(t('Shortcode is required.')),
    phone: Yup.string().required(t('Phone number is required.')),
  });

  const initialFormValues: any = { name, app_name, api_key, shortcode, phone };

  const createTooltip = (title: any) => (
    <Tooltip
      tooltipClass={`${styles.Tooltip} `}
      tooltipArrowClass={styles.TooltipArrow}
      title={title}
      placement="right"
    >
      <InfoIcon className={styles.InfoIcon} />
    </Tooltip>
  );

  const appNameTooltip = createTooltip(
    <p>
      Login to your{' '}
      <a href="https://www.gupshup.io/" target="_blank">
        gupshup account
      </a>{' '}
      <br /> Go to the dashboard section to find your bot name & number.
    </p>
  );

  const apiTooltip = createTooltip(
    <p>
      Login to your{' '}
      <a href="https://www.gupshup.io/" target="_blank">
        gupshup account
      </a>
      <br />
      Go to the dashboard section
      <br />
      Click on account icon on top right to find API keys.
    </p>
  );

  const formFields = [
    {
      component: Input,
      name: 'name',
      type: 'text',
      inputLabel: 'Registered organization name',
      disabled: isDisabled,
    },
    {
      component: PhoneInput,
      name: 'phone',
      type: 'phone',
      inputLabel: 'Chatbot number',
      helperText: 'WhatsApp number that will be used for chatbot',
      disabled: isDisabled,
    },
    {
      component: Input,
      name: 'app_name',
      type: 'text',
      inputLabel: 'App name',
      helperText: (
        <span className={styles.FormHelperText}>Name of your bot on Gupshup. {appNameTooltip}</span>
      ),
      disabled: isDisabled,
    },
    {
      component: Input,
      name: 'api_key',
      type: 'text',
      inputLabel: 'Gupshup API key',
      helperText: (
        <span className={styles.FormHelperText}>Click here to get the API key. {apiTooltip}</span>
      ),
      disabled: isDisabled,
    },
    {
      component: Input,
      name: 'shortcode',
      type: 'text',
      inputLabel: 'URL shortcode',
      helperText: (
        <span className={styles.FormHelperText}>
          Name for your Glific platform. Atleast 7-8 characters without spaces.
        </span>
      ),
      disabled: isDisabled,
    },
  ];

  const setPayload = (payload: any) => {
    const { app_name, shortcode, api_key, phone, name, token } = payload;

    return {
      api_key,
      app_name,
      phone,
      shortcode,
      name,
      token,
    };
  };

  const handleSubmit = async (payload: any, setErrors: Function) => {
    if (isDisabled) handleStepChange();
    setLoading(true);
    await axios.post(ONBOARD_URL_SETUP, payload).then(({ data }) => {
      setLoading(false);
      if (data.is_valid) {
        saveData(
          {
            registration_id: data.registration_id,
            org_id: data.organization?.id,
            submitted: true,
          },
          'registration_details'
        );

        handleStepChange();

        return true;
      } else {
        setErrors(data.messages);
        saveData(data.messages, 'errors');
        return false;
      }
    });
  };

  const setStates = (states: any) => {
    const { api_key, app_name, phone, shortcode, name } = states;

    setOrgName(name);
    setAppName(app_name);
    setShortcode(shortcode);
    setApiKeys(api_key);
    setPhone(phone);
  };

  useEffect(() => {
    const data = localStorage.getItem('registrationData');
    let registrationData;
    if (data) {
      registrationData = JSON.parse(data);
      if (registrationData.registration_details && registrationData.registration_details.submitted)
        setIsDisabled(true);
    }
  }, []);

  return (
    <FormLayout
      validationSchema={FormSchema}
      formFieldItems={formFields}
      initialValues={initialFormValues}
      step={1}
      title="Bot details"
      helperText="Enter platform details and information based on the data queries."
      setStates={setStates}
      setPayload={setPayload}
      identifier="platformDetails"
      handleStepChange={handleStepChange}
      saveData={saveData}
      loading={loading}
      submitData={handleSubmit}
      showModal={true}
      isDisabled={isDisabled}
    />
  );
};
