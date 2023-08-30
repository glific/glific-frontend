import { useEffect, useState } from 'react';
import { useQuery, useApolloClient } from '@apollo/client';
import Typography from '@mui/material/Typography';
import * as Yup from 'yup';
import { useParams } from 'react-router-dom';

import { FormLayout } from 'containers/Form/FormLayout';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { Input } from 'components/UI/Form/Input/Input';
import { Checkbox } from 'components/UI/Form/Checkbox/Checkbox';
import { GET_PROVIDERS, GET_CREDENTIAL } from 'graphql/queries/Organization';
import {
  DELETE_ORGANIZATION,
  CREATE_CREDENTIAL,
  UPDATE_CREDENTIAL,
} from 'graphql/mutations/Organization';
import { ReactComponent as Settingicon } from 'assets/images/icons/Settings/Settings.svg';
import styles from './Providers.module.css';

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
    const fields: any = {};
    Object.assign(fields, keysObj);
    Object.assign(fields, secretsObj);
    Object.keys(fields).forEach((key) => {
      // restore value of the field
      states[key] = fields[key];
    });
    states.isActive = item.isActive;
    setStateValues(states);
  };

  if (credential && !credentialId) {
    const data = credential.credential.credential;
    if (data) {
      // to get credential data
      setCredentialId(data.id);
    }
  }

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
        then: (schema) => schema.nullable().required(`${fields[key].label} is required.`),
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

    Object.keys(fields).forEach((key) => {
      const field = {
        component: Input,
        name: key,
        type: 'text',
        placeholder: fields[key].label,
        label: fields[key].label,
        disabled: fields[key].view_only,
      };
      formField.push(field);

      // create validation object for field
      addValidation(fields, key);

      // add dafault value for the field
      states[key] = fields[key].default;
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

        addField(fields);
        setKeys(providerKeys);
        setSecrets(providerSecrets);
      });
    }
  }, [providerData]);

  const saveHandler = (data: any) => {
    if (data)
      // Update the details of the cache. This is required at the time of restoration
      client.writeQuery({
        query: GET_CREDENTIAL,
        variables: { shortcode: type },
        data: data.updateCredential,
      });
  };

  if (!providerData || loading) return <Loading isWhite />;

  const title = providerData.providers[0].name;

  return (
    <FormLayout
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
      redirect
      afterSave={saveHandler}
      entityId={credentialId}
      noHeading
    />
  );
};

export default Providers;
