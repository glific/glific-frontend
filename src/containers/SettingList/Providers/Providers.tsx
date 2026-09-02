import { useEffect, useState } from 'react';
import { useQuery, useApolloClient } from '@apollo/client';
import Typography from '@mui/material/Typography';
import * as Yup from 'yup';
import { useParams } from 'react-router';
import { useTranslation } from 'react-i18next';

import { FormLayout } from 'containers/Form/FormLayout';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { Input } from 'components/UI/Form/Input/Input';
import { Checkbox } from 'components/UI/Form/Checkbox/Checkbox';
import { Dropdown } from 'components/UI/Form/Dropdown/Dropdown';
import { FileUpload } from 'components/UI/Form/FileUpload/FileUpload';
import { GET_PROVIDERS, GET_CREDENTIAL } from 'graphql/queries/Organization';
import { DELETE_ORGANIZATION, CREATE_CREDENTIAL, UPDATE_CREDENTIAL } from 'graphql/mutations/Organization';
import styles from './Providers.module.css';
import Settingicon from 'assets/images/icons/Settings/Settings.svg?react';

let validation: any = {};
let FormSchema = Yup.object().shape(validation);
const SettingIcon = <Settingicon />;

const GUPSHUP_CREDENTIAL_FIELDS = ['app_name', 'api_key', 'app_id'];

const areAllGupshupFieldsSet = (secretsObj: Record<string, string>) =>
  GUPSHUP_CREDENTIAL_FIELDS.every((field) => secretsObj[field] && secretsObj[field] !== 'NA');

const queries = {
  getItemQuery: GET_CREDENTIAL,
  createItemQuery: CREATE_CREDENTIAL,
  updateItemQuery: UPDATE_CREDENTIAL,
  deleteItemQuery: DELETE_ORGANIZATION,
};

export const Providers = () => {
  const [credentialId, setCredentialId] = useState(null);
  const client = useApolloClient();
  const [stateValues, setStateValues] = useState({});
  const [formFields, setFormFields] = useState([]);
  const [keys, setKeys] = useState({});
  const [secrets, setSecrets] = useState({});
  const params = useParams();
  const type = params.type ? params.type : null;
  const { t } = useTranslation();
  const [isDisabled, setIsDisabled] = useState(false);

  const states: any = {};

  const { data: providerData } = useQuery(GET_PROVIDERS, {
    variables: { filter: { shortcode: type } },
  });
  const { data: credential, loading } = useQuery(GET_CREDENTIAL, {
    variables: { shortcode: type },
  });

  const setCredential = (item: any) => {
    const keysObj = JSON.parse(item.keys);
    const secretsObj = JSON.parse(item.secrets);
    if (type === 'gupshup') {
      setIsDisabled(areAllGupshupFieldsSet(secretsObj));
    }
    const fields: any = {};
    Object.assign(fields, keysObj);
    Object.assign(fields, secretsObj);
    Object.keys(fields).forEach((key) => {
      // restore value of the field
      if (type === 'gupshup' && fields[key] === 'NA') {
        states[key] = '';
      } else {
        states[key] = fields[key];
      }
    });
    states.isActive = item.isActive;

    setStateValues(states);
  };

  useEffect(() => {
    if (credential) {
      const data = credential.credential.credential;
      if (data) {
        // to get credential data
        setCredentialId(data.id);
      }
    } else {
      setCredentialId(null);
    }
  }, [credential]);

  const setPayload = (payload: any) => {
    let object: any = {};
    const secretsObj: any = {};
    const keysObj: any = {};
    Object.keys(secrets).forEach((key) => {
      if (payload[key]) {
        secretsObj[key] = payload[key];
      }
    });

    Object.keys(keys).forEach((key) => {
      if (payload[key]) {
        keysObj[key] = payload[key];
      }
    });
    object = {
      shortcode: type,
      isActive: type === 'gupshup' ? true : payload.isActive,
      keys: JSON.stringify(keysObj),
      secrets: JSON.stringify(secretsObj),
    };
    return object;
  };

  const resetValidation = () => {
    validation = {};
    FormSchema = Yup.object().shape(validation);
  };

  const addValidation = (fields: any, key: string) => {
    validation[key] = Yup.string()
      .nullable()
      .when('isActive', {
        is: true,
        then: (schema) => {
          return schema.nullable().required(`${fields[key].label} is required.`);
        },
        otherwise: (schema) =>
          fields[key].is_required && schema.nullable().required(`${fields[key].label} is required.`),
      });
    FormSchema = Yup.object().shape(validation);
  };

  const addField = (fields: any) => {
    // reset validation to empty
    resetValidation();

    const formField: any = [];
    let orderedKeys;
    if (type === 'gupshup') {
      orderedKeys = GUPSHUP_CREDENTIAL_FIELDS;
    } else {
      formField.push({
        component: Checkbox,
        name: 'isActive',
        title: (
          <Typography variant="h6" className={styles.IsActive}>
            Active?
          </Typography>
        ),
      });
      // jsonb returns object keys sorted by length, so a provider that cares about field
      // order declares `position` on each key. Sorting is stable, so providers that do not
      // declare it keep the order they already had.
      orderedKeys = Object.keys(fields).sort(
        (first, second) => (fields[first]?.position ?? Infinity) - (fields[second]?.position ?? Infinity)
      );
    }

    orderedKeys.forEach((key) => {
      if (fields[key]) {
        // A provider key declaring `type: "select"` or `"upload"` carries everything the field
        // needs, so a provider gets the right control without this page knowing anything about
        // that provider.
        const isSelect = fields[key].type === 'select' && Array.isArray(fields[key].options);
        const isUpload = fields[key].type === 'upload';

        let field;
        if (isSelect) {
          field = {
            component: Dropdown,
            name: key,
            options: fields[key].options,
            // FormLayout renders `label` above every field with the spacing the rest of the
            // form uses. Dropdown would render `placeholder` as a second label of its own,
            // so it is left empty rather than duplicating the name.
            label: fields[key].label,
            placeholder: '',
            disabled: fields[key].view_only,
            skip: fields[key].hide,
          };
        } else if (isUpload) {
          field = {
            component: FileUpload,
            name: key,
            label: fields[key].label,
            maxSizeKb: fields[key].max_size_kb,
            accept: fields[key].accept,
            helperText: fields[key].helper_text,
            disabled: fields[key].view_only,
            skip: fields[key].hide,
          };
        } else {
          field = {
            component: Input,
            name: key,
            type: 'text',
            label: fields[key].label,
            disabled: fields[key].view_only,
            skip: fields[key].hide,
            placeholder:
              type === 'gupshup' && GUPSHUP_CREDENTIAL_FIELDS.includes(key) ? `Enter ${fields[key].label} here` : '',
          };
        }
        formField.push(field);

        // create validation object for field
        addValidation(fields, key);

        // add default value for the field
        states[key] = fields[key].default || '';
      }
    });

    setStateValues(states);
    setFormFields(formField);
  };

  useEffect(() => {
    if (providerData) {
      providerData.providers.forEach((provider: any) => {
        const providerKeys = JSON.parse(provider.keys);
        const providerSecrets = JSON.parse(provider.secrets);

        const fields: any = {};
        Object.assign(fields, providerKeys);
        Object.assign(fields, providerSecrets);

        const credentials = credential?.credential?.credential?.secrets
          ? JSON.parse(credential?.credential?.credential?.secrets)
          : {};

        if (type === 'gupshup') {
          const allFieldsSet = areAllGupshupFieldsSet(credentials);
          Object.keys(fields).forEach((key) => {
            if (GUPSHUP_CREDENTIAL_FIELDS.includes(key)) {
              fields[key].view_only = allFieldsSet;
            }
          });
          setIsDisabled(areAllGupshupFieldsSet(credentials));
        }

        addField(fields);
        setKeys(providerKeys);
        setSecrets(providerSecrets);
      });

      const credentialData = credential?.credential?.credential;
      if (credentialData) {
        setCredential(credentialData);
      }
    }
  }, [providerData, credential]);

  const saveHandler = (data: any) => {
    if (data && data.createCredential) {
      setCredentialId(data.createCredential.credential.id);
    } else if (data && data.updateCredential) {
      setCredential(data.updateCredential.credential);
    }
    if (data)
      // Update the details of the cache. This is required at the time of restoration
      client.writeQuery({
        query: GET_CREDENTIAL,
        variables: { shortcode: type },
        data: { credential: data.updateCredential },
      });
  };

  if (!providerData || loading) return <Loading whiteBackground />;

  const title = providerData.providers[0].name;

  const maytapiConfirmationState = {
    show: true,
    title: t('Are you sure you want to change these credentials?'),
    message: () =>
      t('All information related to this account will be deleted. All data has already been backed up in BigQuery.'),
  };

  const gupshupConfirmationState = {
    show: true,
    title: t('Confirm your credentials'),
    message: (formValues: any) => (
      <div>
        <p>{t('Once submitted, these credentials cannot be changed. Are you sure you want to continue?')}</p>
        <div>
          {t('App Name')}: {formValues.app_name || 'N/A'}
        </div>
        <div>
          {t('API Key')}: {formValues.api_key || 'N/A'}
        </div>
        <div>
          {t('App ID')}: {formValues.app_id || 'N/A'}
        </div>
      </div>
    ),
  };

  const getConfirmationState = () => {
    if (type === 'maytapi') return maytapiConfirmationState;
    if (type === 'gupshup') return gupshupConfirmationState;
    return { show: false, title: '', message: () => '' };
  };

  return (
    <FormLayout
      partialPage
      {...queries}
      title={title}
      states={stateValues}
      setStates={setCredential}
      validationSchema={FormSchema}
      setPayload={setPayload}
      listItemName="Settings"
      dialogMessage=""
      formFields={formFields}
      redirectionLink="settings"
      cancelLink="settings"
      linkParameter="id"
      listItem="credential"
      icon={SettingIcon}
      languageSupport={false}
      type="settings"
      redirect={false}
      afterSave={saveHandler}
      entityId={credentialId}
      noHeading
      confirmationState={getConfirmationState()}
      buttonState={{
        text: isDisabled ? 'Credentials Locked' : 'Save',
        status: isDisabled && type === 'gupshup',
        show: true,
      }}
    />
  );
};

export default Providers;
