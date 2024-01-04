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

  const { t } = useTranslation();

  const States = {
    name,
    activeLanguages,
    defaultLanguage,
    signaturePhrase,
    phone,
    tier,
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

  const setStates = ({
    name: nameValue,
    activeLanguages: activeLanguagesValue,
    defaultLanguage: defaultLanguageValue,
    signaturePhrase: signaturePhraseValue,
    contact: contactValue,
  }: any) => {
    setName(nameValue);
    setSignaturePhrase(signaturePhraseValue);
    if (activeLanguagesValue) setActiveLanguages(activeLanguagesValue);
    if (defaultLanguageValue) setDefaultLanguage(defaultLanguageValue);
    setPhone(contactValue.phone);
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

  if (!languages) return <Loading />;

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

  const validation = {
    name: Yup.string().required(t('Organisation name is required.')),
    activeLanguages: Yup.array().required(t('Supported Languages is required.')),
    defaultLanguage: Yup.object().nullable().required(t('Default Language is required.')),
    signaturePhrase: Yup.string().nullable().required(t('Webhook signature is required.')),
  };

  const FormSchema = Yup.object().shape(validation);

  const formFields: any = [
    {
      component: Input,
      name: 'name',
      type: 'text',
      placeholder: t('Organisation name'),
    },
    {
      component: AutoComplete,
      name: 'activeLanguages',
      options: languages.languages,
      optionLabel: 'label',
      textFieldProps: {
        variant: 'outlined',
        label: t('Supported languages'),
      },
      validate: validateActiveLanguages,
    },
    {
      component: AutoComplete,
      name: 'defaultLanguage',
      options: languages.languages,
      optionLabel: 'label',
      multiple: false,
      textFieldProps: {
        variant: 'outlined',
        label: t('Default language'),
      },
      validate: validateDefaultLanguage,
    },
    {
      component: Input,
      name: 'signaturePhrase',
      type: 'text',
      placeholder: t('Webhook signature'),
    },

    {
      component: Input,
      name: 'phone',
      type: 'text',
      placeholder: t('Organisation phone number'),
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
      skip: !tier,
      disabled: true,
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
    };
    return object;
  };

  return (
    <FormLayout
      backLinkButton={{ text: t('Back to settings'), link: '/settings' }}
      {...queries}
      title="organization settings"
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
    />
  );
};

export default Organisation;
