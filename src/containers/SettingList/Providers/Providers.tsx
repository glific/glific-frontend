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
import { GET_PROVIDERS, GET_CREDENTIAL } from 'graphql/queries/Organization';
import { DELETE_ORGANIZATION, CREATE_CREDENTIAL, UPDATE_CREDENTIAL } from 'graphql/mutations/Organization';
import styles from './Providers.module.css';
import Settingicon from 'assets/images/icons/Settings/Settings.svg?react';

let validation: any = {};
let FormSchema = Yup.object().shape(validation);
const SettingIcon = <Settingicon />;

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
    fetchPolicy: 'no-cache', // This is required to restore the data after save
  });

  const setCredential = (item: any) => {
    const keysObj = JSON.parse(item.keys);
    const secretsObj = JSON.parse(item.secrets);
    if (type === 'gupshup' && secretsObj.app_id && secretsObj.app_id !== 'NA') {
      setIsDisabled(true);
    }
    const fields: any = {};
    Object.assign(fields, keysObj);
    Object.assign(fields, secretsObj);
    Object.keys(fields).forEach((key) => {
      // restore value of the field
      if (type === 'gupshup' && (fields[key] === 'NA')) {
        states[key] = '';
      }
      else {
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
      isActive: payload.isActive,
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
          if (type === 'gupshup' && key === 'app_id') {
            return schema;
          }
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

    const formField: any = [
      {
        component: Checkbox,
        name: 'isActive',
        title: (
          <Typography variant="h6" className={styles.IsActive}>
            Active?
          </Typography>
        ),
      },
    ];
    let orderedKeys;
    if (type === 'gupshup') {
      orderedKeys = ['app_name', 'api_key', 'app_id'];
    } else {
      orderedKeys = Object.keys(fields);
    }

    orderedKeys.forEach((key) => {
      if (fields[key]) {
        const field = {
          component: Input,
          name: key,
          type: 'text',
          label: fields[key].label,
          disabled: fields[key].view_only,
          skip: fields[key].hide,
          placeholder: type === 'gupshup' && (key === 'app_name' || key === 'api_key') ? `Enter ${fields[key].label} here` : '',
        };
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

        if (type === 'gupshup' && credentials.app_id && credentials.app_id !== 'NA') {
          Object.keys(fields).forEach((key) => {
            fields[key].view_only = true;
          });
        }

        addField(fields);
        setKeys(providerKeys);
        setSecrets(providerSecrets);
      });
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
      }}
    />
  );
};

export default Providers;
