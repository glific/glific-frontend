import React, { useState } from 'react';
import { useQuery, useApolloClient } from '@apollo/client';
import Typography from '@material-ui/core/Typography';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';

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

export interface ProvidersProps {
  match: any;
}

let validation: any = {};
let FormSchema = Yup.object().shape(validation);
const SettingIcon = <Settingicon />;

const queries = {
  getItemQuery: GET_CREDENTIAL,
  createItemQuery: CREATE_CREDENTIAL,
  updateItemQuery: UPDATE_CREDENTIAL,
  deleteItemQuery: DELETE_ORGANIZATION,
};

export const Providers: React.SFC<ProvidersProps> = ({ match }) => {
  const type = match.params.type ? match.params.type : null;
  const [credentialId, setCredentialId] = useState(null);
  const client = useApolloClient();
  const { t } = useTranslation();

  const param = { params: { id: credentialId, shortcode: type } };
  const states: any = {};
  let keys: any = {};
  let secrets: any = {};
  let formFields: any = [];

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
  };

  const { data: providerData } = useQuery(GET_PROVIDERS, {
    variables: { filter: { shortcode: type } },
  });
  const { data: credential, loading } = useQuery(GET_CREDENTIAL, {
    variables: { shortcode: type },
    fetchPolicy: 'no-cache', // This is required to restore the data after save
  });

  if (credential && !credentialId) {
    const data = credential.credential.credential;
    if (data) {
      // to get credential data
      setCredentialId(data.id);
    }
  }

  if (!providerData || loading) return <Loading />;

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

  const handleChange = (value: any) => {
    states.isActive = value;
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
        then: Yup.string().nullable().required(`${fields[key].label} is required.`),
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
          <Typography variant="h6" style={{ color: '#073f24' }}>
            {t('Is active?')}
          </Typography>
        ),
        handleChange,
      },
    ];
    const defaultStates: any = {};
    Object.keys(fields).forEach((key) => {
      Object.assign(defaultStates, { [key]: fields[key].default });
      const field = {
        component: Input,
        name: key,
        type: 'text',
        placeholder: fields[key].label,
        disabled: fields[key].view_only,
      };
      formField.push(field);

      // create validation object for field
      addValidation(fields, key);

      // add dafault value for the field
      states[key] = fields[key].default;
    });
    formFields = formField;
  };

  const title = providerData.providers[0].name;
  providerData.providers.forEach((provider: any) => {
    keys = JSON.parse(provider.keys);
    secrets = JSON.parse(provider.secrets);
    const fields = {};
    Object.assign(fields, keys);
    Object.assign(fields, secrets);
    addField(fields);
  });

  const saveHandler = (data: any) => {
    if (data)
      // Update the details of the cache. This is required at the time of restoration
      client.writeQuery({
        query: GET_CREDENTIAL,
        variables: { shortcode: type },
        data: data.updateCredential,
      });
  };

  return (
    <FormLayout
      backLinkButton={{ text: t('Back to settings'), link: '/settings' }}
      {...queries}
      title={title}
      match={param}
      states={states}
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
    />
  );
};

export default Providers;
