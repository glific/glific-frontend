import { useState } from 'react';
import * as Yup from 'yup';
import { useMutation, useQuery } from '@apollo/client';
import { CircularProgress, Typography } from '@mui/material';
import { useLocation, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useTranslation } from 'react-i18next';

import TriggerIcon from 'assets/images/icons/Trigger/Union.svg?react';
import {
  dateList,
  dayList,
  FLOW_STATUS_PUBLISHED,
  ISO_DATE_FORMAT,
  hourList,
  setVariables,
  EXTENDED_TIME_FORMAT,
  CONTACTS_COLLECTION,
} from 'common/constants';
import { FormLayout } from 'containers/Form/FormLayout';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { TimePicker } from 'components/UI/Form/TimePicker/TimePicker';
import { Calendar } from 'components/UI/Form/Calendar/Calendar';
import { Checkbox } from 'components/UI/Form/Checkbox/Checkbox';
import { getAddOrRemoveRoleIds } from 'common/utils';
import { GET_FLOWS } from 'graphql/queries/Flow';
import { GET_COLLECTIONS } from 'graphql/queries/Collection';
import { GET_TRIGGER } from 'graphql/queries/Trigger';
import {
  CREATE_TRIGGER,
  DELETE_TRIGGER,
  UPDATE_TRIGGER,
  VALIDATE_TRIGGER,
} from 'graphql/mutations/Trigger';
import styles from './Trigger.module.css';
import { triggerInfo } from 'common/HelpData';
import { TriggerType } from './TriggerType/TriggerType';
import { getOrganizationServices } from 'services/AuthService';
dayjs.extend(utc);

const checkDateTimeValidation = (startAtValue: string, startDateValue: string) => {
  const isDateAhead = dayjs(startDateValue).isAfter(dayjs());
  const isTimeAhead = dayjs(startAtValue).isAfter(dayjs());

  if (!isDateAhead) {
    // if start date is current date then only check for time
    if (isTimeAhead) {
      return true;
    }
    return false;
  }
  return true;
};

const setPayload = (payload: any, roles: any, groupType: any) => {
  const payloadCopy = payload;

  const { startDate, startTime, isActive, flowId, frequencyValues, groupIds, endDate, frequency } =
    payloadCopy;

  const groups = groupIds.map((group: any) => parseInt(group.id));
  const startAtTime = dayjs(startTime).format(EXTENDED_TIME_FORMAT);
  // covert the time to UTC
  const startAt = dayjs(`${dayjs(startDate).format(ISO_DATE_FORMAT)}${startAtTime}`).utc();

  const updatedPayload = {
    isActive,
    isRepeating: true,
    flowId: flowId.id,
    days: [],
    hours: [],
    groupIds: groups,
    startDate: dayjs(startAt).utc().format(ISO_DATE_FORMAT),
    endDate: dayjs(endDate).utc().format(ISO_DATE_FORMAT),
    startTime: dayjs(startAt).utc().format(EXTENDED_TIME_FORMAT),
    frequency: frequency.value,
    roles: payload.roles,
    groupType: groupType,
  };

  switch (updatedPayload.frequency) {
    case 'weekly':
    case 'monthly':
      updatedPayload.days = frequencyValues.map((value: any) => value.id);
      break;
    case 'hourly':
      updatedPayload.hours = frequencyValues.map((value: any) => value.id);
      break;
    case 'daily':
      updatedPayload.days = [];
      updatedPayload.hours = [];
      break;
    default:
      updatedPayload.days = [];
      updatedPayload.hours = [];
      updatedPayload.isRepeating = false;
  }

  const payloadWithRoleIds = getAddOrRemoveRoleIds(roles, updatedPayload);

  return payloadWithRoleIds;
};

const getFrequencyDetails = (
  frequencyValue: string,
  daysValue: Array<any>,
  hoursValue: Array<any>
) => {
  const frequencyDetails = {
    values: [],
    options: dayList,
    label: 'Select days',
  };
  switch (frequencyValue) {
    case 'weekly':
      frequencyDetails.values = dayList.filter((day: any) => daysValue.includes(day.id));
      break;
    case 'monthly':
      frequencyDetails.values = dateList.filter((day: any) => daysValue.includes(day.id));
      frequencyDetails.options = dateList;
      frequencyDetails.label = 'Select dates';
      break;
    case 'hourly':
      frequencyDetails.values = hourList.filter((day: any) => hoursValue.includes(day.id));
      frequencyDetails.options = hourList;
      frequencyDetails.label = 'Select hours';
      break;
    default:
  }

  return frequencyDetails;
};

const triggerIcon = <TriggerIcon className={styles.TriggerIcon} />;

const queries = {
  getItemQuery: GET_TRIGGER,
  createItemQuery: CREATE_TRIGGER,
  updateItemQuery: UPDATE_TRIGGER,
  deleteItemQuery: DELETE_TRIGGER,
};

export const Trigger = () => {
  const [flowId, setFlowId] = useState(null);
  const [isActive, setIsActive] = useState(true);
  const [startTime, setStartTime] = useState<any>('');
  const [startDate, setStartDate] = useState<any>('');
  const [frequency, setfrequency] = useState<any>(null);
  const [endDate, setEndDate] = useState<any>('');
  const [isRepeating, setIsRepeating] = useState(null);
  const [frequencyValues, setFrequencyValues] = useState([]);
  const [roles, setRoles] = useState([]);
  const [daysDisabled, setDaysDisabled] = useState(true);
  const [groupIds, setGroupIds] = useState<any>(null);
  const [minDate, setMinDate] = useState<any>(dayjs());
  const [triggerFlowWarning, setTriggerFlowWarning] = useState<any>();
  const [frequencyLabel, setFrequencyLabel] = useState('Select days');
  const [frequencyOptions, setFrequencyOptions] = useState(dayList);
  const [groupType, setGroupType] = useState(CONTACTS_COLLECTION);
  const isWhatsAppGroupEnabled = getOrganizationServices('whatsappGroupEnabled');

  const params = useParams();
  const location = useLocation();
  const { t } = useTranslation();
  const states = {
    flowId,
    startTime,
    startDate,
    frequency,
    endDate,
    isRepeating,
    frequencyValues,
    groupIds,
    isActive,
    roles,
  };

  const triggerFrequencyOptions = [
    { label: t('Does not repeat'), value: 'none' },
    { label: t('Hourly'), value: 'hourly' },
    { label: t('Daily'), value: 'daily' },
    { label: t('Weekly'), value: 'weekly' },
    { label: t('Monthly'), value: 'monthly' },
  ];
  const dialogMessage = t("You won't be able to use this for tagging messages.");

  let isEditing = false;
  let type;

  const isCopyState = location.state === 'copy';

  if (params.id && !isCopyState) {
    isEditing = true;
  }

  if (isCopyState) {
    queries.updateItemQuery = CREATE_TRIGGER;
    type = 'copy';
  } else {
    queries.updateItemQuery = UPDATE_TRIGGER;
  }

  const schemaShape: any = {
    flowId: Yup.object().nullable().required(t('Flow is required')),

    startDate: Yup.string().nullable().required(t('Start date is required')),

    endDate: Yup.string()
      .nullable()
      .required(t('End date is required'))
      .when('startDate', ([startDateValue], schema: any) =>
        schema.test({
          test: (endDateValue: any) =>
            startDateValue && dayjs(endDateValue).isAfter(startDateValue),
          message: t('End date should be greater than the start date'),
        })
      ),

    frequencyValues: Yup.array()
      .nullable()
      .when('frequency', {
        is: (frequencyValue: any) => frequencyValue && frequencyValue.value === 'weekly',
        then: (schema) => schema.min(1, t('Please select a day')),
      })
      .when('frequency', {
        is: (frequencyValue: any) => frequencyValue && frequencyValue.value === 'monthly',
        then: (schema) => schema.min(1, t('Please select a date')),
      }),

    frequency: Yup.object().nullable().required(t('Repeat is required')),
    groupIds: Yup.array().nullable().required(t('Collection is required')),
  };

  if (!isEditing) {
    schemaShape.startTime = Yup.string()
      .required(t('Time is required.'))
      .when('startDate', ([startDateValue], schema: any) =>
        schema.test({
          test: (startAtValue: any) => checkDateTimeValidation(startAtValue, startDateValue),
          message: t('Start time should be greater than current time'),
        })
      );
  }

  const FormSchema = Yup.object().shape(schemaShape);

  const { data: flow } = useQuery(GET_FLOWS, {
    variables: setVariables({
      status: FLOW_STATUS_PUBLISHED,
    }),
    fetchPolicy: 'network-only', // set for now, need to check cache issue
  });

  const { data: collections } = useQuery(GET_COLLECTIONS, {
    variables: isEditing ? setVariables() : setVariables({ groupType }),
  });

  const [validateTriggerFlow, { loading }] = useMutation(VALIDATE_TRIGGER, {
    onCompleted: ({ validateTrigger }) => {
      if (!validateTrigger.success && validateTrigger.errors && validateTrigger.errors.length > 0) {
        setTriggerFlowWarning(validateTrigger.errors[0].message);
      }
    },
  });

  if (!flow) return <Loading />;

  const handleFlowChange = (flow: any) => {
    setTriggerFlowWarning(undefined);
    if (flow) {
      validateTriggerFlow({
        variables: {
          input: {
            flowId: flow.id,
          },
        },
      });
    }
  };

  const handleFrequencyChange = (triggerFrequency: any) => {
    if (!triggerFrequency) return;
    const { value } = triggerFrequency;
    setDaysDisabled(false);

    switch (value) {
      case 'weekly':
        setFrequencyLabel(t('Select days'));
        setFrequencyOptions(dayList);
        break;
      case 'monthly':
        setFrequencyLabel(t('Select dates'));
        setFrequencyOptions(dateList);
        break;
      case 'hourly':
        setFrequencyLabel(t('Select hours'));
        setFrequencyOptions(hourList);
        break;
      default:
        setDaysDisabled(true);
    }
    setFrequencyValues([]);
  };

  const formFields = [
    {
      component: Checkbox,
      name: 'isActive',
      title: (
        <Typography variant="h6" className={styles.IsActive}>
          Active?
        </Typography>
      ),
      darkCheckbox: true,
    },
    {
      component: AutoComplete,
      name: 'flowId',
      options: flow.flows,
      optionLabel: 'name',
      disabled: isEditing,
      multiple: false,
      label: t('Select flow'),
      onChange: handleFlowChange,
      helperText: loading ? (
        <>
          Validating flow...
          <CircularProgress size="12px" />
        </>
      ) : triggerFlowWarning ? (
        <div className={styles.Warning}>{`Warning: ${triggerFlowWarning}`} </div>
      ) : (
        ''
      ),
    },

    {
      component: Calendar,
      type: 'date',
      name: 'startDate',
      disabled: isEditing,
      label: t('Date range'),
      placeholder: t('Start date'),
      minDate,
      className: styles.CalendarLeft,
    },
    {
      component: Calendar,
      type: 'date',
      name: 'endDate',
      placeholder: t('End date'),
      disabled: isEditing,
      minDate,
      className: styles.CalendarRight,
    },
    {
      component: TimePicker,
      name: 'startTime',
      disabled: isEditing,
      label: t('Time'),
    },
    {
      component: AutoComplete,
      name: 'frequency',
      label: t('Repeat'),
      options: triggerFrequencyOptions,
      optionLabel: 'label',
      disabled: isEditing,
      valueElementName: 'value',
      multiple: false,
      onChange: handleFrequencyChange,
    },

    {
      component: AutoComplete,
      name: 'frequencyValues',
      label: frequencyLabel,
      options: frequencyOptions,
      disabled: isEditing || daysDisabled,
      optionLabel: 'label',
      helperText:
        frequency === 'monthly' &&
        t(
          'If you are selecting end of the month dates, then for the ones not present i.e. 30, 31, the selection will default to the last day of that month.'
        ),
    },
    {
      component: TriggerType,
      name: 'groupType',
      handleOnChange: (value: any) => setGroupType(value),
      groupType: groupType,
      isWhatsAppGroupEnabled: isWhatsAppGroupEnabled,
    },
    {
      component: AutoComplete,
      name: 'groupIds',
      label: t('Select collection'),
      options: collections?.groups,
      disabled: isEditing,
      optionLabel: 'label',
    },
  ];

  const setStates = ({
    days: daysValue,
    hours: hoursValue,
    endDate: endDateValue,
    flow: flowValue,
    frequency: frequencyValue,
    groups: groupValue,
    isActive: isActiveValue,
    isRepeating: isRepeatingValue,
    startAt: startAtValue,
    roles: rolesValue,
    groupType,
  }: any) => {
    setIsRepeating(isRepeatingValue);
    setEndDate(endDateValue);
    setIsActive(isCopyState ? true : isActiveValue);
    setEndDate(dayjs(endDateValue));
    setGroupType(groupType);

    const { values, options, label } = getFrequencyDetails(frequencyValue, daysValue, hoursValue);
    setFrequencyValues(values);
    setFrequencyOptions(options);
    setFrequencyLabel(label);
    setStartDate(dayjs(startAtValue));
    // If a user wants to update the trigger
    if (dayjs().isAfter(startAtValue, 'days')) {
      setMinDate(dayjs(startAtValue));
    }
    setStartTime(startAtValue ? dayjs(startAtValue) : null);
    setfrequency(triggerFrequencyOptions.filter((trigger) => trigger.value === frequencyValue)[0]);
    setDaysDisabled(frequencyValue !== 'weekly' && frequencyValue !== 'monthly');

    setRoles(rolesValue);

    const getFlowId = flow.flows.filter((flows: any) => flows.id === flowValue.id);

    if (getFlowId.length > 0) {
      setFlowId(getFlowId[0]);
    }

    if (groupValue && collections?.groups && groupValue.length > 0) {
      const selectedGroups = collections?.groups.filter((group: any) =>
        groupValue.includes(group.label)
      );
      setGroupIds(selectedGroups);
    }
  };

  return (
    <FormLayout
      {...queries}
      states={states}
      roleAccessSupport
      setStates={setStates}
      setPayload={(payload: any) => setPayload(payload, roles, groupType)}
      validationSchema={FormSchema}
      languageSupport={false}
      listItemName="trigger"
      dialogMessage={dialogMessage}
      formFields={formFields}
      redirectionLink="trigger"
      listItem="trigger"
      type={type}
      copyNotification={t('Copy of the trigger has been created!')}
      icon={triggerIcon}
      customStyles={styles.Triggers}
      helpData={triggerInfo}
    />
  );
};

export default Trigger;
