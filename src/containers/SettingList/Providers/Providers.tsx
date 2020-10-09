import React, { useState } from 'react';
import { useQuery, useApolloClient } from '@apollo/client';
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
import { Checkbox } from '../../../components/UI/Form/Checkbox/Checkbox';
import Typography from '@material-ui/core/Typography';

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
  let param = { params: { id: credentialId, shortcode: type } };
  let states: any = {};
  let keys: any = {};
  let secrets: any = {};
  let formFields: any = [];

  const setCredential = (item: any) => {
    let keys = JSON.parse(item.keys);
    let secrets = JSON.parse(item.secrets);
    let fields: any = {};
    Object.assign(fields, keys);
    Object.assign(fields, secrets);
    Object.keys(fields).map((key) => {
      // restore value of the field
      states[key] = fields[key];
    });
    states['isActive'] = item.isActive;
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
      // to get credential data
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
      isActive: payload.isActive,
      keys: JSON.stringify(keysObj),
      secrets: JSON.stringify(secretsObj),
    };
    return object;
  };

  const handleChange = (value: any) => {
    states['isActive'] = value;
  };

  const addField = (fields: any) => {
    // reset validation to empty
    resetValidation();

    let formField: any = [
      {
        component: Checkbox,
        name: 'isActive',
        title: (
          <Typography variant="h6" style={{ color: '#073f24' }}>
            Is active?
          </Typography>
        ),
        handleChange: handleChange,
      },
    ];
    let defaultStates: any = {};
    Object.keys(fields).map((key) => {
      Object.assign(defaultStates, { [key]: fields[key].default });
      let field = {
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

  const addValidation = (fields: any, key: string) => {
    validation[key] = Yup.string()
      .nullable()
      .when('isActive', {
        is: true,
        then: Yup.string()
          .nullable()
          .required(fields[key].label + ` is required.`),
      });
    FormSchema = Yup.object().shape(validation);
  };

  const resetValidation = () => {
    validation = {};
    FormSchema = Yup.object().shape(validation);
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

  const saveHandler = (data: any) => {
    // Update the details of the cache. This is required at the time of restoration
    client.writeQuery({
      query: GET_CREDENTIAL,
      variables: { shortcode: type },
      data: data.updateCredential,
    });
  };

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
      redirectionLink="settings"
      cancelLink="settings"
      linkParameter="id"
      listItem={'credential'}
      icon={SettingIcon}
      languageSupport={false}
      type={'settings'}
      redirect={true}
      afterSave={saveHandler}
    />
  );
};
