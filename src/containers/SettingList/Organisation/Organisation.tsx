import { useState, useEffect } from 'react';
import { useQuery, useLazyQuery, useApolloClient } from '@apollo/client';
import { IconButton, InputAdornment } from '@mui/material';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';

import { Loading } from 'components/UI/Layout/Loading/Loading';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { Input } from 'components/UI/Form/Input/Input';
import { FormLayout } from 'containers/Form/FormLayout';
import { GET_ORGANIZATION, GET_QUALITY_RATING, USER_LANGUAGES } from 'graphql/queries/Organization';
import {
  CREATE_ORGANIZATION,
  DELETE_ORGANIZATION,
  UPDATE_ORGANIZATION,
} from 'graphql/mutations/Organization';
import { GET_LANGUAGES } from 'graphql/queries/List';
import Settingicon from 'assets/images/icons/Settings/Settings.svg?react';
import CopyIcon from 'assets/images/icons/Settings/Copy.svg?react';
import { copyToClipboard } from 'common/utils';
import styles from './Organisation.module.css';
import { Checkbox } from 'components/UI/Form/Checkbox/Checkbox';

const SettingIcon = <Settingicon />;

const queries = {
  getItemQuery: GET_ORGANIZATION,
  createItemQuery: CREATE_ORGANIZATION,
  updateItemQuery: UPDATE_ORGANIZATION,
  deleteItemQuery: DELETE_ORGANIZATION,
};

export const Organisation = () => {
  const client = useApolloClient();
  const [name, setName] = useState('');
  const [organizationId, setOrganizationId] = useState(null);
  const [activeLanguages, setActiveLanguages] = useState([]);
  const [defaultLanguage, setDefaultLanguage] = useState<any>(null);
  const [signaturePhrase, setSignaturePhrase] = useState('');
  const [phone, setPhone] = useState<string>('');
  const [tier, setTier] = useState();
  const [lowBalanceThreshold, setLowBalanceThreshold] = useState('');
  const [criticalBalanceThreshold, setCriticalBalanceThreshold] = useState('');
  const [sendWarningMail, setSendWarningMail] = useState<boolean>(false);

  const { t } = useTranslation();

  const States = {
    name,
    activeLanguages,
    defaultLanguage,
    signaturePhrase,
    phone,
    tier,
    lowBalanceThreshold,
    criticalBalanceThreshold,
    sendWarningMail,
  };

  const { data: languages } = useQuery(GET_LANGUAGES, {
    variables: { opts: { order: 'ASC' } },
  });

  useQuery(GET_QUALITY_RATING, {
    onCompleted: (tierData) => {
      if (tierData) setTier(tierData.qualityRating?.currentLimit);
    },
  });

  const [getOrg, { data: orgData }] = useLazyQuery<any>(GET_ORGANIZATION);

  const setSettings = (data: any) => {
    setLowBalanceThreshold(data.lowBalanceThreshold);
    setCriticalBalanceThreshold(data.criticalBalanceThreshold);
    setSendWarningMail(data.sendWarningMail);
  };

  const setStates = ({
    name: nameValue,
    activeLanguages: activeLanguagesValue,
    defaultLanguage: defaultLanguageValue,
    signaturePhrase: signaturePhraseValue,
    contact: contactValue,
    setting: settingValue,
  }: any) => {
    setName(nameValue);
    setSignaturePhrase(signaturePhraseValue);
    if (activeLanguagesValue) setActiveLanguages(activeLanguagesValue);
    if (defaultLanguageValue) setDefaultLanguage(defaultLanguageValue);
    setPhone(contactValue.phone);
    setSettings(settingValue);
  };

  useEffect(() => {
    getOrg();
  }, [getOrg]);

  useEffect(() => {
    if (orgData) {
      const data = orgData.organization.organization;
      // get login OrganizationId
      setOrganizationId(data.id);
    }
  }, [orgData]);

  if (!languages) return <Loading whiteBackground />;

  let activeLanguage: any = [];
  const validateActiveLanguages = (value: any) => {
    activeLanguage = value;
    if (!value || value.length === 0) {
      return t('Supported language is required.');
    }
    return null;
  };

  const validateDefaultLanguage = (value: any) => {
    let error;
    if (!value) {
      error = t('Default language is required.');
    }
    if (value) {
      const IsPresent = activeLanguage.filter((language: any) => language.id === value.id);
      if (IsPresent.length === 0) error = t('Default language needs to be an active language.');
    }
    return error;
  };

  const handleSendWarningMails = (sendWarningMail: boolean) => {
    setSendWarningMail(sendWarningMail);
  };

  const validation = {
    name: Yup.string().required(t('Organisation name is required.')),
    activeLanguages: Yup.array().required(t('Supported Languages is required.')),
    defaultLanguage: Yup.object().nullable().required(t('Default Language is required.')),
    signaturePhrase: Yup.string().nullable().required(t('Webhook signature is required.')),
    criticalBalanceThreshold: Yup.number()
      .min(0, t('Threshold value should not be negative!'))
      .required(t('Critical Balance Threshold is required.')),
    lowBalanceThreshold: Yup.number()
      .min(0, t('Threshold value should not be negative!'))
      .required(t('Low Balance Threshold is required.')),
    sendWarningMail: Yup.bool(),
  };

  const FormSchema = Yup.object().shape(validation);

  const formFields: any = [
    {
      component: Input,
      name: 'name',
      type: 'text',
      placeholder: t('Organisation name'),
      label: t('Organisation name'),
    },
    {
      component: AutoComplete,
      name: 'activeLanguages',
      options: languages.languages,
      optionLabel: 'label',
      label: t('Supported languages'),
      validate: validateActiveLanguages,
    },
    {
      component: AutoComplete,
      name: 'defaultLanguage',
      options: languages.languages,
      optionLabel: 'label',
      multiple: false,
      label: t('Default language'),
      validate: validateDefaultLanguage,
    },
    {
      component: Input,
      name: 'signaturePhrase',
      type: 'text',
      placeholder: t('Webhook signature'),
      label: t('Webhook signature'),
    },

    {
      component: Input,
      name: 'phone',
      type: 'text',
      label: t('Organisation phone number'),
      disabled: true,
      endAdornment: (
        <InputAdornment position="end">
          <IconButton
            aria-label="phone number"
            data-testid="phoneNumber"
            onClick={() => copyToClipboard(phone)}
            edge="end"
          >
            <CopyIcon />
          </IconButton>
        </InputAdornment>
      ),
    },
    {
      component: Input,
      name: 'tier',
      type: 'text',
      placeholder: t('WhatsApp tier'),
      label: t('WhatsApp tier'),
      skip: !tier,
      disabled: true,
    },
    {
      component: Checkbox,
      name: 'sendWarningMail',
      handleChange: handleSendWarningMails,
      title: t('Recieve warning mails?'),
    },
    {
      component: Input,
      name: 'lowBalanceThreshold',
      type: 'number',
      placeholder: t('Low balance threshold for warning emails'),
      disabled: !sendWarningMail,
      helperText: t('Recieve low balance threshold mails once a week.'),
    },
    {
      component: Input,
      name: 'criticalBalanceThreshold',
      type: 'number',
      placeholder: t('Critical balance threshold for warning emails'),
      disabled: !sendWarningMail,
      helperText: t('Recieve critical balance threshold mails every two days.'),
    },
  ];

  const saveHandler = (data: any) => {
    // update organization details in the cache
    client.writeQuery({
      query: GET_ORGANIZATION,
      data: data.updateOrganization,
    });
  };

  const setPayload = (payload: any) => {
    let object: any = {};
    // set active Language Ids
    const activeLanguageIds = payload.activeLanguages.map((language: any) => language.id);

    object = {
      name: payload.name,
      activeLanguageIds,
      signaturePhrase: payload.signaturePhrase,
      defaultLanguageId: payload.defaultLanguage.id,
      setting: {
        lowBalanceThreshold: payload.lowBalanceThreshold.toString(),
        criticalBalanceThreshold: payload.criticalBalanceThreshold.toString(),
        sendWarningMail: payload.sendWarningMail,
      },
    };
    return object;
  };

  return (
    <FormLayout
      {...queries}
      title="Organization settings"
      states={States}
      setStates={setStates}
      validationSchema={FormSchema}
      setPayload={setPayload}
      listItemName="Settings"
      dialogMessage=""
      formFields={formFields}
      refetchQueries={[{ query: USER_LANGUAGES }]}
      redirectionLink="settings"
      cancelLink="settings"
      linkParameter="id"
      listItem="organization"
      icon={SettingIcon}
      languageSupport={false}
      type="settings"
      redirect
      afterSave={saveHandler}
      customStyles={styles.organization}
      entityId={organizationId}
      noHeading
    />
  );
};

export default Organisation;
