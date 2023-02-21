import { useState, useEffect } from 'react';
import { useQuery, useLazyQuery, useApolloClient } from '@apollo/client';
import { IconButton, InputAdornment, Typography } from '@mui/material';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';

import { Checkbox } from 'components/UI/Form/Checkbox/Checkbox';
import { TimePicker } from 'components/UI/Form/TimePicker/TimePicker';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { Input } from 'components/UI/Form/Input/Input';
import { FormLayout } from 'containers/Form/FormLayout';
import { GET_FLOWS } from 'graphql/queries/Flow';
import { GET_ORGANIZATION, USER_LANGUAGES } from 'graphql/queries/Organization';
import {
  CREATE_ORGANIZATION,
  DELETE_ORGANIZATION,
  UPDATE_ORGANIZATION,
} from 'graphql/mutations/Organization';
import { GET_LANGUAGES } from 'graphql/queries/List';
import { ReactComponent as Settingicon } from 'assets/images/icons/Settings/Settings.svg';
import { ReactComponent as CopyIcon } from 'assets/images/icons/Settings/Copy.svg';
import { dayList, FLOW_STATUS_PUBLISHED, setVariables } from 'common/constants';
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
  const [allDayCheck, setAllDayCheck] = useState(false);
  const [activeLanguages, setActiveLanguages] = useState([]);
  const [defaultLanguage, setDefaultLanguage] = useState<any>(null);
  const [signaturePhrase, setSignaturePhrase] = useState();
  const [phone, setPhone] = useState<string>('');

  const { t } = useTranslation();

  const States = {
    name,
    hours,
    startTime,
    endTime,
    enabledDays,
    defaultFlowId,
    flowId,
    activeLanguages,
    newcontactFlowEnabled,
    defaultLanguage,
    signaturePhrase,
    newcontactFlowId,
    allDayCheck,
    phone,
  };

  // get the published flow list
  const { data: flow } = useQuery(GET_FLOWS, {
    variables: setVariables({
      status: FLOW_STATUS_PUBLISHED,
    }),
    fetchPolicy: 'network-only', // set for now, need to check cache issue
  });

  const { data: languages } = useQuery(GET_LANGUAGES, {
    variables: { opts: { order: 'ASC' } },
  });

  const [getOrg, { data: orgData }] = useLazyQuery<any>(GET_ORGANIZATION);

  const getEnabledDays = (data: any) => data.filter((option: any) => option.enabled);

  const setOutOfOffice = (data: any) => {
    setStartTime(data.startTime);
    setEndTime(data.endTime);
    setEnabledDays(getEnabledDays(data.enabledDays));
  };

  const getFlow = (id: string) => flow.flows.filter((option: any) => option.id === id)[0];

  const setStates = ({
    name: nameValue,
    outOfOffice: outOfOfficeValue,
    activeLanguages: activeLanguagesValue,
    defaultLanguage: defaultLanguageValue,
    signaturePhrase: signaturePhraseValue,
    contact: contactValue,
    newcontactFlowId: newcontactFlowIdValue,
  }: any) => {
    setName(nameValue);
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

    // set the value only if out of office flow is not null
    if (outOfOfficeValue.flowId) {
      setFlowId(getFlow(outOfOfficeValue.flowId));
    }

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

      const days = orgData.organization.organization.outOfOffice.enabledDays;
      const selectedDays = Object.keys(days).filter((k) => days[k].enabled === true);

      // show another flow if days are selected
      if (selectedDays.length > 0) setIsFlowDisable(false);
    }
  }, [orgData]);

  if (!flow || !languages) return <Loading />;

  const handleChange = (value: any) => {
    setIsDisable(!value);
  };

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
    name: Yup.string().required(t('Organisation name is required.')),
    activeLanguages: Yup.array().required(t('Supported Languages is required.')),
    defaultLanguage: Yup.object().nullable().required(t('Default Language is required.')),
    signaturePhrase: Yup.string().nullable().required(t('Webhook signature is required.')),
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
        then: Yup.object().nullable().required(t('New contact flow is required.')),
      }),
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
      component: Checkbox,
      name: 'hours',
      title: <Typography className={styles.CheckboxLabel}>{t('Default flow')}</Typography>,
      handleChange,
    },
    {
      component: Checkbox,
      name: 'newcontactFlowEnabled',
      title: <Typography className={styles.CheckboxLabel}>{t('New contact flow')}</Typography>,
      handleChange: setNewcontactFlowEnabled,
    },
    {
      component: AutoComplete,
      name: 'defaultFlowId',
      options: flow.flows,
      optionLabel: 'name',
      multiple: false,
      textFieldProps: {
        variant: 'outlined',
        label: t('Select flow'),
      },
      disabled: isDisabled,
      helperText: t(
        'The selected flow will trigger when end-users aren’t in any flow, their message doesn’t match any keyword, and the time of their message is as defined above.'
      ),
      validate: validateOutOfOfficeFlow,
    },
    {
      component: AutoComplete,
      name: 'newcontactFlowId',
      options: flow.flows,
      optionLabel: 'name',
      multiple: false,
      disabled: !newcontactFlowEnabled,
      textFieldProps: {
        variant: 'outlined',
        label: t('Select flow'),
      },
      helperText: t('For new contacts messaging your chatbot for the first time'),
    },
    {
      component: AutoComplete,
      name: 'enabledDays',
      options: dayList,
      optionLabel: 'label',
      textFieldProps: {
        variant: 'outlined',
        label: t('Select days'),
      },
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
    },

    {
      component: TimePicker,
      name: 'startTime',
      placeholder: t('Start'),
      disabled: isDisabled || allDayCheck,
      helperText: t('Note: The next day begins after 12AM.'),
    },
    {
      component: TimePicker,
      name: 'endTime',
      placeholder: t('Stop'),
      disabled: isDisabled || allDayCheck,
    },
  ];
  if (isFlowDisabled === false) {
    formFields.push({
      component: AutoComplete,
      name: 'flowId',
      options: flow.flows,
      optionLabel: 'name',
      multiple: false,
      textFieldProps: {
        variant: 'outlined',
        label: t('Select flow'),
      },
      disabled: isDisabled,
      questionText: t('Would you like to trigger a flow for all the other days & times?'),
    });
  }

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
    const activeLanguageIds = payload.activeLanguages.map((language: any) => language.id);
    let newContactFlowId = null;

    if (newcontactFlowEnabled) {
      newContactFlowId = payload.newcontactFlowId.id;
    }
    const defaultLanguageId = payload.defaultLanguage.id;

    object = {
      name: payload.name,
      outOfOffice: {
        defaultFlowId: payload.defaultFlowId ? payload.defaultFlowId.id : null,
        enabled: payload.hours,
        enabledDays: assignDays(payload.enabledDays),
        endTime: payload.endTime,
        flowId: payload.flowId ? payload.flowId.id : null,
        startTime: payload.startTime,
      },

      defaultLanguageId,
      activeLanguageIds,
      newcontactFlowId: newContactFlowId,
      signaturePhrase: payload.signaturePhrase,
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
