import React, { useState, useEffect } from 'react';
import styles from './OrganisationSettings.module.css';
import * as Yup from 'yup';
import { Input } from '../../components/UI/Form/Input/Input';
import { FormLayout } from '../Form/FormLayout';
import { GET_AUTOMATIONS } from '../../graphql/queries/Automation';
import { GET_ORGANIZATION } from '../../graphql/queries/Organization';
import {
  CREATE_ORGANIZATION,
  DELETE_ORGANIZATION,
  UPDATE_ORGANIZATION,
} from '../../graphql/mutations/Organization';
import { ReactComponent as Settingicon } from '../../assets/images/icons/Settings/Settings.svg';
import { Checkbox } from '../../components/UI/Form/Checkbox/Checkbox';
import { TimePicker } from '../../components/UI/Form/TimePicker/TimePicker';
import { useQuery, useLazyQuery } from '@apollo/client';
import { Loading } from '../../components/UI/Layout/Loading/Loading';
import { AutoComplete } from '../../components/UI/Form/AutoComplete/AutoComplete';
import Typography from '@material-ui/core/Typography/Typography';
import { GET_LANGUAGES } from '../../graphql/queries/List';

export interface SettingsProps {
  match: any;
}

const FormSchema = Yup.object().shape({
  name: Yup.string().required('Organisation name is required.'),
  providerAppname: Yup.string().required('Gupshup API key is required.'),
  providerPhone: Yup.string().required('Gupshup WhatsApp number is required.'),
});

const SettingIcon = <Settingicon />;

const queries = {
  getItemQuery: GET_ORGANIZATION,
  createItemQuery: CREATE_ORGANIZATION,
  updateItemQuery: UPDATE_ORGANIZATION,
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

export const OrganisationSettings: React.SFC<SettingsProps> = () => {
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
  const [activeLanguages, setActiveLanguages] = useState([]);
  const [defaultLanguage, setDefaultLanguage] = useState<any>({});

  const states = {
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

  useEffect(() => {
    getOrg();
  }, []);

  const { data } = useQuery(GET_AUTOMATIONS);
  const { data: languages } = useQuery(GET_LANGUAGES);
  const [getOrg, { data: orgData }] = useLazyQuery<any>(GET_ORGANIZATION);

  useEffect(() => {
    if (orgData) {
      let data = orgData.organization.organization;
      //get login OrganizationId
      setOrganizationId(data.id);
    }
  }, [orgData]);

  if (!data || !orgData || !languages) return <Loading />;

  const handleChange = (value: any) => {
    setIsDisable(!value);
  };
  let activeLanguage: any = [];
  const validateActiveLanguages = (value: any) => {
    activeLanguage = value;
    if (!value || value.length === 0) {
      return 'Active languages is required.';
    }
  };

  const validateDefaultLanguage = (value: any) => {
    let error;
    if (!value) {
      error = 'Default languages is required.';
    }
    if (value) {
      const IsPresent = activeLanguage.filter((language: any) => language.id === value.id);
      if (IsPresent.length === 0) error = 'Default Language needs to be an active Language.';
    }
    return error;
  };

  const formFields = [
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
      placeholder: 'Gupshup API key',
    },
    {
      component: Input,
      name: 'providerPhone',
      type: 'text',
      placeholder: 'Gupshup WhatsApp number',
    },
    {
      component: AutoComplete,
      name: 'activeLanguages',
      options: languages.languages,
      optionLabel: 'label',
      textFieldProps: {
        variant: 'outlined',
        label: 'Select active languages',
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
        label: 'Default languages',
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

  const setPayload = (payload: any) => {
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

    return {
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
  };

  return (
    <FormLayout
      {...queries}
      title="Settings"
      match={{ params: { id: organizationId } }}
      states={states}
      setStates={setStates}
      validationSchema={FormSchema}
      setPayload={setPayload}
      listItemName="Settings"
      dialogMessage={''}
      formFields={formFields}
      redirectionLink=""
      cancelLink="chat"
      linkParameter="id"
      listItem="organization"
      icon={SettingIcon}
      languageSupport={false}
      type={'settings'}
      redirect={false}
    />
  );
};
