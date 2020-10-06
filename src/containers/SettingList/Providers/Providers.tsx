import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import * as Yup from 'yup';
import { Loading } from '../../../components/UI/Layout/Loading/Loading';
import { Input } from '../../../components/UI/Form/Input/Input';
import { FormLayout } from '../../Form/FormLayout';
import { GET_PROVIDERS, GET_CREDENTIAL } from '../../../graphql/queries/Organization';
import {
  DELETE_ORGANIZATION,
  CREATE_CREDENTIAL,
  UPDATE_CREDENTIAL,
} from '../../../graphql/mutations/Organization';
import { ReactComponent as Settingicon } from '../../../assets/images/icons/Settings/Settings.svg';

export interface ProvidersProps {
  match: any;
}

const FormSchema = Yup.object().shape({});
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

  let param = { params: { id: credentialId, shortcode: type } };
  let states: any = {};
  let keys: any = {};
  let secrets: any = {};
  let formFields: any = [];

  const setCredential = (item: any) => {
    keys = JSON.parse(item.keys);
    secrets = JSON.parse(item.secrets);
    let fields: any = {};
    Object.assign(fields, keys);
    Object.assign(fields, secrets);
    Object.keys(fields).map((key) => {
      // restore value for the field
      states[key] = fields[key];
    });
  };

  const { data: providerData } = useQuery(GET_PROVIDERS, {
    variables: { filter: { shortcode: type } },
  });
  const { data: credential, loading } = useQuery(GET_CREDENTIAL, {
    variables: { shortcode: type },
    fetchPolicy: 'no-cache', // This is required to restore the data after save
  });

  if (credential && !credentialId) {
    let data = credential.credential.credential;
    if (data) {
      //get credential data
      setCredentialId(data.id);
    }
  }

  if (!providerData || loading) return <Loading />;

  const setPayload = (payload: any) => {
    let object: any = {};
    let secretsObj: any = {};
    let keysObj: any = {};
    Object.keys(secrets).map((key) => {
      if (payload[key]) {
        secretsObj[key] = payload[key];
      }
    });
    Object.keys(keys).map((key) => {
      if (payload[key]) {
        keysObj[key] = payload[key];
      }
    });
    object = {
      shortcode: type,
      keys: JSON.stringify(keysObj),
      secrets: JSON.stringify(secretsObj),
    };
    return object;
  };

  const addField = (fields: any) => {
    let formField: any = [];
    let defaultStates: any = {};

    Object.keys(fields).map((key) => {
      // add dafault value for the field
      states[key] = fields[key].default;
      Object.assign(defaultStates, { [key]: fields[key].default });
      let field = {
        component: Input,
        name: key,
        type: 'text',
        placeholder: fields[key].label,
        disabled: fields[key].view_only,
      };
      formField.push(field);
    });
    formFields = formField;
  };

  if (providerData) {
    providerData.providers.map((provider: any) => {
      keys = JSON.parse(provider.keys);
      secrets = JSON.parse(provider.secrets);
      let fields = {};
      Object.assign(fields, keys);
      Object.assign(fields, secrets);
      addField(fields);
    });
  }

  return (
    <FormLayout
      backLinkButton={{ text: 'Back to settings', link: '/settings' }}
      {...queries}
      title={type}
      match={param}
      states={states}
      setStates={setCredential}
      validationSchema={FormSchema}
      setPayload={setPayload}
      listItemName="Settings"
      dialogMessage={''}
      formFields={formFields}
      redirectionLink=""
      cancelLink="settings"
      linkParameter="id"
      listItem={'credential'}
      icon={SettingIcon}
      languageSupport={false}
      type={'settings'}
      redirect={false}
    />
  );
};
