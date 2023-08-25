import { useState, useEffect } from 'react';
import { useQuery, useLazyQuery, useApolloClient } from '@apollo/client';
import { Typography } from '@mui/material';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';

import { Checkbox } from 'components/UI/Form/Checkbox/Checkbox';
import { TimePicker } from 'components/UI/Form/TimePicker/TimePicker';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { FormLayout } from 'containers/Form/FormLayout';
import { GET_FLOWS } from 'graphql/queries/Flow';
import { GET_ORGANIZATION, USER_LANGUAGES } from 'graphql/queries/Organization';
import {
  CREATE_ORGANIZATION,
  DELETE_ORGANIZATION,
  UPDATE_ORGANIZATION,
} from 'graphql/mutations/Organization';
import { ReactComponent as Settingicon } from 'assets/images/icons/Settings/Settings.svg';
import { dayList, FLOW_STATUS_PUBLISHED, setVariables } from 'common/constants';
import styles from './OrganisationFlows.module.css';

const SettingIcon = <Settingicon />;

const queries = {
  getItemQuery: GET_ORGANIZATION,
  createItemQuery: CREATE_ORGANIZATION,
  updateItemQuery: UPDATE_ORGANIZATION,
  deleteItemQuery: DELETE_ORGANIZATION,
};

export const OrganisationFlows = () => {
  const client = useApolloClient();
  const [hours, setHours] = useState(true);
  const [enabledDays, setEnabledDays] = useState<any>([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [defaultFlowId, setDefaultFlowId] = useState<any>(null);
  const [flowId, setFlowId] = useState<any>(null);
  const [isDisabled, setIsDisable] = useState(false);
  const [isFlowDisabled, setIsFlowDisable] = useState(true);
  const [organizationId, setOrganizationId] = useState(null);
  const [newcontactFlowId, setNewcontactFlowId] = useState(null);
  const [newcontactFlowEnabled, setNewcontactFlowEnabled] = useState(false);
  const [optinFlowId, setOptinFlowId] = useState(null);
  const [optinFlowEnabled, setOptinFlowEnabled] = useState(false);
  const [allDayCheck, setAllDayCheck] = useState(false);

  const { t } = useTranslation();

  const States = {
    hours,
    startTime,
    endTime,
    enabledDays,
    defaultFlowId,
    flowId,
    optinFlowId,
    newcontactFlowEnabled,
    optinFlowEnabled,
    newcontactFlowId,
    allDayCheck,
  };

  // get the published flow list
  const { data: flow } = useQuery(GET_FLOWS, {
    variables: setVariables({
      status: FLOW_STATUS_PUBLISHED,
    }),
    fetchPolicy: 'network-only', // set for now, need to check cache issue
  });

  const [getOrg, { data: orgData }] = useLazyQuery<any>(GET_ORGANIZATION);

  const getEnabledDays = (data: any) => data.filter((option: any) => option.enabled);

  const setOutOfOffice = (data: any) => {
    setStartTime(data.startTime);
    setEndTime(data.endTime);
    setEnabledDays(getEnabledDays(data.enabledDays));
  };

  const getFlow = (id: string) => {
    const flowFound = flow.flows.filter((option: any) => option.id === id);
    if (flowFound.length > 0) {
      return flowFound[0];
    } else return null;
  };

  const setStates = ({
    outOfOffice: outOfOfficeValue,
    newcontactFlowId: newcontactFlowIdValue,
    optinFlowId: optinFlowIdValue,
  }: any) => {
    setHours(outOfOfficeValue.enabled);
    setIsDisable(!outOfOfficeValue.enabled);
    setOutOfOffice(outOfOfficeValue);

    if (outOfOfficeValue.startTime === '00:00:00' && outOfOfficeValue.endTime === '23:59:00') {
      setAllDayCheck(true);
    }
    if (outOfOfficeValue.defaultFlowId) {
      // set the value only if default flow is not null
      setDefaultFlowId(getFlow(outOfOfficeValue.defaultFlowId));
    }

    if (newcontactFlowIdValue) {
      setNewcontactFlowEnabled(true);
      setNewcontactFlowId(getFlow(newcontactFlowIdValue));
    }
    if (optinFlowIdValue) {
      setOptinFlowEnabled(true);
      setOptinFlowId(getFlow(optinFlowIdValue));
    }

    // set the value only if out of office flow is not null
    if (outOfOfficeValue.flowId) {
      setFlowId(getFlow(outOfOfficeValue.flowId));
    }
  };

  useEffect(() => {
    getOrg();
  }, [getOrg]);

  useEffect(() => {
    if (orgData) {
      const data = orgData.organization.organization;
      // get login OrganizationId
      setOrganizationId(data.id);

      const days = orgData.organization.organization.outOfOffice.enabledDays;
      const selectedDays = Object.keys(days).filter((k) => days[k].enabled === true);

      // show another flow if days are selected
      if (selectedDays.length > 0) setIsFlowDisable(false);
    }
  }, [orgData]);

  if (!flow)
    return (
      <div className={styles.LoadingBackground}>
        <Loading />
      </div>
    );

  const handleChange = (value: any) => {
    setIsDisable(!value);
  };

  const validateOutOfOfficeFlow = (value: any) => {
    let error;
    if (!isDisabled && !value) {
      error = t('Please select default flow ');
    }

    return error;
  };

  const validateDaysSelection = (value: any) => {
    let error;
    if (!isDisabled && value.length === 0) {
      error = t('Please select days');
    }

    return error;
  };

  const handleAllDayCheck = (addDayCheck: boolean) => {
    if (!allDayCheck) {
      setStartTime('00:00:00');
      setEndTime('23:59:00');
    }
    setAllDayCheck(addDayCheck);
  };

  const handleChangeInDays = (value: any) => {
    if (value.length > 0) {
      setIsFlowDisable(false);
    }
  };

  const validation = {
    endTime: Yup.string()
      .test('is-midnight', t('End time cannot be 12 AM'), (value) => value !== 'T00:00:00')
      .test('is-valid', t('Not a valid time'), (value) => value !== 'Invalid date'),
    startTime: Yup.string().test(
      'is-valid',
      t('Not a valid time'),
      (value) => value !== 'Invalid date'
    ),
    newcontactFlowId: Yup.object()
      .nullable()
      .when('newcontactFlowEnabled', {
        is: (val: string) => val,
        then: (schema) => schema.nullable().required(t('New contact flow is required.')),
      }),
    optinFlowId: Yup.object()
      .nullable()
      .when('optinFlowEnabled', {
        is: (val: string) => val,
        then: (schema) => schema.nullable().required(t('Optin flow is required.')),
      }),
  };

  const FormSchema = Yup.object().shape(validation);

  let defaultFlowFields: any = [
    {
      component: Checkbox,
      name: 'hours',
      title: <Typography className={styles.CheckboxLabel}>{t('Default flow')}</Typography>,
      handleChange,
    },

    {
      component: AutoComplete,
      name: 'defaultFlowId',
      options: flow.flows,
      optionLabel: 'name',
      multiple: false,
      label: t('Select flow'),
      placeholder: t('Select flow'),
      disabled: isDisabled,
      helperText: t(
        'The selected flow will trigger when end-users aren’t in any flow, their message doesn’t match any keyword, and the time of their message is as defined below.'
      ),
      validate: validateOutOfOfficeFlow,
    },

    {
      component: AutoComplete,
      name: 'enabledDays',
      options: dayList,
      optionLabel: 'label',
      label: t('Select days'),
      disabled: isDisabled,
      onChange: handleChangeInDays,
      validate: validateDaysSelection,
    },
    {
      component: Checkbox,
      disabled: isDisabled,
      name: 'allDayCheck',
      title: <Typography className={styles.AddDayLabel}>{t('All day')}</Typography>,
      handleChange: handleAllDayCheck,
      className: styles.AllDayCheck,
    },

    {
      component: TimePicker,
      name: 'startTime',
      label: t('Start'),
      disabled: isDisabled || allDayCheck,
      helperText: t('Note: The next day begins after 12AM.'),
    },
    {
      component: TimePicker,
      name: 'endTime',
      label: t('Stop'),
      disabled: isDisabled || allDayCheck,
    },
  ];

  if (!isFlowDisabled) {
    defaultFlowFields = [
      ...defaultFlowFields,
      {
        component: AutoComplete,
        name: 'flowId',
        options: flow.flows,
        optionLabel: 'name',
        multiple: false,
        label: t('Select flow'),
        placeholder: t('Select flow'),
        disabled: isDisabled,
        questionText: t('Would you like to trigger a flow for all the other days & times?'),
      },
    ];
  }

  const formFields: any = [
    ...defaultFlowFields,
    {
      component: Checkbox,
      name: 'newcontactFlowEnabled',
      title: <Typography className={styles.CheckboxLabel}>{t('New contact flow')}</Typography>,
      handleChange: setNewcontactFlowEnabled,
    },
    {
      component: AutoComplete,
      name: 'newcontactFlowId',
      options: flow.flows,
      optionLabel: 'name',
      multiple: false,
      disabled: !newcontactFlowEnabled,
      label: t('Select flow'),
      helperText: t('For new contacts messaging your chatbot for the first time'),
    },

    {
      component: Checkbox,
      name: 'optinFlowEnabled',
      title: <Typography className={styles.CheckboxLabel}>{t('Optin flow')}</Typography>,
      handleChange: setOptinFlowEnabled,
    },
    {
      component: AutoComplete,
      name: 'optinFlowId',
      options: flow.flows,
      optionLabel: 'name',
      multiple: false,
      disabled: !optinFlowEnabled,
      label: t('Select flow'),
      placeholder: t('Select flow'),
    },
  ];

  const assignDays = (enabledDay: any) => {
    const array: any = [];
    for (let i = 0; i < 7; i += 1) {
      array[i] = { id: i + 1, enabled: false };
      enabledDay.forEach((days: any) => {
        if (i + 1 === days.id) {
          array[i] = { id: i + 1, enabled: true };
        }
      });
    }
    return array;
  };

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
    let newContactFlowId = null;
    let optinFlowId = null;

    if (newcontactFlowEnabled) {
      newContactFlowId = payload.newcontactFlowId.id;
    }

    if (optinFlowEnabled) {
      optinFlowId = payload.optinFlowId.id;
    }
    object = {
      outOfOffice: {
        defaultFlowId: payload.defaultFlowId ? payload.defaultFlowId.id : null,
        enabled: payload.hours,
        enabledDays: assignDays(payload.enabledDays),
        endTime: payload.endTime,
        flowId: payload.flowId ? payload.flowId.id : null,
        startTime: payload.startTime,
      },
      newcontactFlowId: newContactFlowId,
      optinFlowId,
    };
    return object;
  };

  return (
    <FormLayout
      {...queries}
      title="Organization flows"
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

export default OrganisationFlows;
