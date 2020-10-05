import React, { useState, useEffect } from 'react';
import { useQuery, useLazyQuery, useApolloClient } from '@apollo/client';
import Typography from '@material-ui/core/Typography/Typography';
import * as Yup from 'yup';
import { Checkbox } from '../../../components/UI/Form/Checkbox/Checkbox';
import { TimePicker } from '../../../components/UI/Form/TimePicker/TimePicker';
import { Loading } from '../../../components/UI/Layout/Loading/Loading';
import { AutoComplete } from '../../../components/UI/Form/AutoComplete/AutoComplete';
import { Input } from '../../../components/UI/Form/Input/Input';
import { FormLayout } from '../../Form/FormLayout';
import { GET_AUTOMATIONS } from '../../../graphql/queries/Automation';
import {
  GET_ORGANIZATION,
  GET_PROVIDERS,
  GET_CREDENTIAL,
  USER_LANGUAGES,
} from '../../../graphql/queries/Organization';
import {
  CREATE_ORGANIZATION,
  DELETE_ORGANIZATION,
  UPDATE_ORGANIZATION,
  CREATE_CREDENTIAL,
  UPDATE_CREDENTIAL,
} from '../../../graphql/mutations/Organization';
import { GET_LANGUAGES } from '../../../graphql/queries/List';
import { ReactComponent as Settingicon } from '../../../assets/images/icons/Settings/Settings.svg';

export interface SettingsProps {
  match: any;
}

const validation = {
  name: Yup.string().required('Organisation name is required.'),
  providerAppname: Yup.string().required('Gupshup API key is required.'),
  providerPhone: Yup.string().required('Gupshup WhatsApp number is required.'),
};

let FormSchema = Yup.object().shape({});

const SettingIcon = <Settingicon />;

const org_queries = {
  getItemQuery: GET_ORGANIZATION,
  createItemQuery: CREATE_ORGANIZATION,
  updateItemQuery: UPDATE_ORGANIZATION,
  deleteItemQuery: DELETE_ORGANIZATION,
};

const credential_queries = {
  getItemQuery: GET_CREDENTIAL,
  createItemQuery: CREATE_CREDENTIAL,
  updateItemQuery: UPDATE_CREDENTIAL,
  deleteItemQuery: DELETE_ORGANIZATION,
};

const dayList = [
  { id: 1, label: 'Monday' },
  { id: 2, label: 'Tuesday' },
  { id: 3, label: 'Wednesday' },
  { id: 4, label: 'Thursday' },
  { id: 5, label: 'Friday' },
  { id: 6, label: 'Saturday' },
  { id: 7, label: 'Sunday' },
];

let CardList = [{ label: 'Organisation', shortcode: 'organization' }];

export const Settings: React.SFC<SettingsProps> = ({ match }) => {
  const type = match.params.type ? match.params.type : null;
  const client = useApolloClient();
  const [name, setName] = useState('');
  const [providerAppname, setProviderAppname] = useState('');
  const [providerPhone, setProviderNumber] = useState('');
  const [hours, setHours] = useState(true);
  const [enabledDays, setEnabledDays] = useState<any>([]);
  const [startTime, setStartTime] = useState();
  const [endTime, setEndTime] = useState();
  const [flowId, setFlowId] = useState<any>({});
  const [IsDisabled, setIsDisable] = useState(false);
  const [organizationId, setOrganizationId] = useState(null);
  const [credentialId, setCredentialId] = useState(null);
  const [activeLanguages, setActiveLanguages] = useState([]);
  const [defaultLanguage, setDefaultLanguage] = useState<any>({});

  let queries;
  let param;
  let states: any = {};
  let keys: any = {};
  let secrets: any = {};

  const orgStates = {
    name,
    providerAppname,
    providerPhone,
    hours,
    startTime,
    endTime,
    enabledDays,
    flowId,
    activeLanguages,
    defaultLanguage,
  };

  if (type === 'organization') {
    queries = org_queries;
    param = { params: { id: organizationId } };
    FormSchema = Yup.object().shape(validation);
    states = orgStates;
  } else {
    queries = credential_queries;
    param = { params: { id: credentialId, shortcode: type } };
    FormSchema = Yup.object().shape({});
  }

  const setStates = ({
    name,
    providerAppname,
    providerPhone,
    outOfOffice,
    activeLanguages,
    defaultLanguage,
  }: any) => {
    setName(name);
    setProviderAppname(providerAppname);
    setProviderNumber(providerPhone);
    setHours(outOfOffice.enabled);
    setIsDisable(!outOfOffice.enabled);
    setOutOfOffice(outOfOffice);
    setFlowId(getFlow(outOfOffice.flowId));
    if (activeLanguages) setActiveLanguages(activeLanguages);
    if (defaultLanguage) setDefaultLanguage(defaultLanguage);
  };

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

  const setOutOfOffice = (data: any) => {
    setStartTime(data.startTime);
    setEndTime(data.endTime);
    setEnabledDays(getEnabledDays(data.enabledDays));
  };

  const getEnabledDays = (data: any) => {
    return data.filter((option: any) => option.enabled);
  };

  const getFlow = (id: string) => {
    return data.flows.filter((option: any) => option.id === id)[0];
  };

  const { data } = useQuery(GET_AUTOMATIONS);
  const { data: providerData } = useQuery(GET_PROVIDERS, {
    variables: { filter: { shortcode: type } },
  });
  const { data: credential, loading } = useQuery(GET_CREDENTIAL, {
    variables: { shortcode: type },
  });
  const { data: languages } = useQuery(GET_LANGUAGES, {
    variables: { opts: { order: 'ASC' } },
  });
  const [getOrg, { data: orgData }] = useLazyQuery<any>(GET_ORGANIZATION);

  useEffect(() => {
    if (type === 'organization') {
      getOrg();
    }
  }, [getOrg]);

  useEffect(() => {
    if (orgData) {
      let data = orgData.organization.organization;
      //get login OrganizationId
      setOrganizationId(data.id);
    }
  }, [orgData]);

  if (credential && !credentialId) {
    let data = credential.credential.credential;
    if (data) {
      //get credential data
      setCredentialId(data.id);
    }
  }

  if (!data || !languages || !providerData || loading) return <Loading />;

  const handleChange = (value: any) => {
    setIsDisable(!value);
  };
  let activeLanguage: any = [];
  const validateActiveLanguages = (value: any) => {
    activeLanguage = value;
    if (!value || value.length === 0) {
      return 'Supported language is required.';
    }
  };

  const validateDefaultLanguage = (value: any) => {
    let error;
    if (!value) {
      error = 'Default language is required.';
    }
    if (value) {
      const IsPresent = activeLanguage.filter((language: any) => language.id === value.id);
      if (IsPresent.length === 0) error = 'Default language needs to be an active language.';
    }
    return error;
  };

  let formFields: any = [
    {
      component: Input,
      name: 'name',
      type: 'text',
      placeholder: 'Organisation name',
    },
    {
      component: Input,
      name: 'providerAppname',
      type: 'text',
      placeholder: 'Provider App name',
    },
    {
      component: Input,
      name: 'providerPhone',
      type: 'text',
      placeholder: 'Provider WhatsApp number',
    },
    {
      component: AutoComplete,
      name: 'activeLanguages',
      options: languages.languages,
      optionLabel: 'label',
      textFieldProps: {
        variant: 'outlined',
        label: 'Supported languages',
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
        label: 'Default language',
      },
      validate: validateDefaultLanguage,
    },
    {
      component: Checkbox,
      name: 'hours',
      title: (
        <Typography variant="h6" style={{ color: '#073f24' }}>
          Hours of operations
        </Typography>
      ),
      handleChange: handleChange,
    },
    {
      component: TimePicker,
      name: 'startTime',
      placeholder: 'Opens',
      disabled: IsDisabled,
    },
    {
      component: TimePicker,
      name: 'endTime',
      placeholder: 'Closes',
      disabled: IsDisabled,
    },
    {
      component: AutoComplete,
      name: 'enabledDays',
      options: dayList,
      optionLabel: 'label',
      textFieldProps: {
        variant: 'outlined',
        label: 'Select days',
      },
      disabled: IsDisabled,
    },
    {
      component: AutoComplete,
      name: 'flowId',
      options: data.flows,
      optionLabel: 'name',
      multiple: false,
      textFieldProps: {
        variant: 'outlined',
        label: 'Select default flow',
      },
      disabled: IsDisabled,
      helperText:
        'the selected flow will be triggered for messages received outside hours of operations',
    },
  ];

  const assignDays = (enabledDays: any) => {
    let array: any = [];
    for (let i = 0; i < 7; i++) {
      array[i] = { id: i + 1, enabled: false };
      enabledDays.map((days: any) => {
        if (i + 1 === days.id) {
          array[i] = { id: i + 1, enabled: true };
        }
      });
    }
    return array;
  };

  const saveHandler = (data: any) => {
    if (type === 'organization') {
      // update organization details in the cache
      client.writeQuery({
        query: GET_ORGANIZATION,
        data: data.updateOrganization,
      });
    }
  };

  const setPayload = (payload: any) => {
    let object: any = {};
    if (type === 'organization') {
      // set active Language Ids
      let activeLanguageIds = payload.activeLanguages.map((activeLanguage: any) => {
        return activeLanguage.id;
      });

      // remove activeLanguages from the payload
      delete payload['activeLanguages'];
      // set default Language Id
      let defaultLanguageId = payload.defaultLanguage.id;
      // remove defaultLanguage from the payload
      delete payload['defaultLanguage'];

      object = {
        name: payload.name,
        providerAppname: payload.providerAppname,
        providerPhone: payload.providerPhone,
        outOfOffice: {
          enabled: payload.hours,
          enabledDays: assignDays(payload.enabledDays),
          endTime: payload.endTime,
          flowId: payload.flowId ? payload.flowId.id : null,
          startTime: payload.startTime,
        },
        defaultLanguageId: defaultLanguageId,
        activeLanguageIds: activeLanguageIds,
      };
    } else {
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
    }

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

  if (providerData && type !== 'organization') {
    providerData.providers.map((provider: any) => {
      keys = JSON.parse(provider.keys);
      secrets = JSON.parse(provider.secrets);
      let fields = {};
      Object.assign(fields, keys);
      Object.assign(fields, secrets);
      addField(fields);
      //create list
      if (CardList.filter((list: any) => list.label === provider.name).length <= 0)
        CardList.push({ label: provider.name, shortcode: provider.shortcode });
    });
  }

  return (
    <FormLayout
      backLinkButton={{ text: 'Back to settings', link: '/settings' }}
      {...queries}
      title={type}
      match={param}
      states={states}
      setStates={type === 'organization' ? setStates : setCredential}
      validationSchema={FormSchema}
      setPayload={setPayload}
      listItemName="Settings"
      dialogMessage={''}
      formFields={formFields}
      refetchQueries={{ onUpdate: USER_LANGUAGES }}
      redirectionLink=""
      cancelLink="settings"
      linkParameter="id"
      listItem={type === 'organization' ? 'organization' : 'credential'}
      icon={SettingIcon}
      languageSupport={false}
      type={'settings'}
      redirect={false}
      afterSave={saveHandler}
    />
  );
};
