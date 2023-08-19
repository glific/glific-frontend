import { useState } from 'react';
import * as Yup from 'yup';
import { useQuery } from '@apollo/client';
import { Typography } from '@mui/material';
import moment from 'moment';
import { useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { ReactComponent as TriggerIcon } from 'assets/images/icons/Trigger/Union.svg';
import { dateList, dayList, FLOW_STATUS_PUBLISHED, hourList, setVariables } from 'common/constants';
import { FormLayout } from 'containers/Form/FormLayout';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { TimePicker } from 'components/UI/Form/TimePicker/TimePicker';
import { Calendar } from 'components/UI/Form/Calendar/Calendar';
import { Checkbox } from 'components/UI/Form/Checkbox/Checkbox';
import { GET_FLOWS } from 'graphql/queries/Flow';
import { getAddOrRemoveRoleIds } from 'common/utils';
import { GET_COLLECTIONS } from 'graphql/queries/Collection';
import { GET_TRIGGER } from 'graphql/queries/Trigger';
import { CREATE_TRIGGER, DELETE_TRIGGER, UPDATE_TRIGGER } from 'graphql/mutations/Trigger';
import styles from './Trigger.module.css';

const checkDateTimeValidation = (startAtValue: string, startDateValue: string) => {
  const isDateAhead = moment(startDateValue).isAfter(moment());
  const isTimeAhead = startAtValue > moment().format('THH:mm:ss');

  if (!isDateAhead) {
    // if start date is current date then only check for time
    if (isTimeAhead) {
      return true;
    }
    return false;
  }
  return true;
};

const setPayload = (payload: any, roles: any) => {
  const payloadCopy = payload;

  const { startDate, startTime, isActive, flowId, frequencyValues, groupId, endDate, frequency } =
    payloadCopy;
  // covert the time to UTC
  const startAt = moment(`
    ${moment(startDate).format('yyyy-MM-DD')}${startTime}`).utc();
  const updatedPayload = {
    isActive,
    isRepeating: true,
    flowId: flowId.id,
    days: [],
    hours: [],
    groupId: groupId.id,
    startDate: moment(startAt).format('yyyy-MM-DD'),
    endDate: moment(endDate).format('yyyy-MM-DD'),
    startTime: moment(startAt).format('THH:mm:ss'),
    frequency: frequency.value,
    roles: payload.roles,
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
    placeholder: 'Select days',
  };
  switch (frequencyValue) {
    case 'weekly':
      frequencyDetails.values = dayList.filter((day: any) => daysValue.includes(day.id));
      break;
    case 'monthly':
      frequencyDetails.values = dateList.filter((day: any) => daysValue.includes(day.id));
      frequencyDetails.options = dateList;
      frequencyDetails.placeholder = 'Select dates';
      break;
    case 'hourly':
      frequencyDetails.values = hourList.filter((day: any) => hoursValue.includes(day.id));
      frequencyDetails.options = hourList;
      frequencyDetails.placeholder = 'Select hours';
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
  const [startTime, setStartTime] = useState('');
  const [startDate, setStartDate] = useState<any>(null);
  const [frequency, setfrequency] = useState<any>(null);
  const [endDate, setEndDate] = useState<any>(null);
  const [isRepeating, setIsRepeating] = useState('');
  const [frequencyValues, setFrequencyValues] = useState([]);
  const [roles, setRoles] = useState([]);
  const [daysDisabled, setDaysDisabled] = useState(true);
  const [groupId, setGroupId] = useState<any>(null);
  const [minDate, setMinDate] = useState<any>(moment().utc());
  const [frequencyPlaceholder, setFrequencyPlaceholder] = useState('Select days');
  const [frequencyOptions, setFrequencyOptions] = useState(dayList);
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
    groupId,
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
            startDateValue && moment(endDateValue).isAfter(startDateValue),
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
    groupId: Yup.object().nullable().required(t('Collection is required')),
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
    variables: setVariables(),
  });

  if (!flow || !collections) return <Loading />;

  const handleFrequencyChange = (triggerFrequency: any) => {
    if (!triggerFrequency) return;
    const { value } = triggerFrequency;
    setDaysDisabled(false);

    switch (value) {
      case 'weekly':
        setFrequencyPlaceholder(t('Select days'));
        setFrequencyOptions(dayList);
        break;
      case 'monthly':
        setFrequencyPlaceholder(t('Select dates'));
        setFrequencyOptions(dateList);
        break;
      case 'hourly':
        setFrequencyPlaceholder(t('Select hours'));
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
          Is active?
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
      textFieldProps: {
        variant: 'outlined',
        label: t('Select flow'),
      },
    },
    {
      component: Calendar,
      type: 'date',
      name: 'startDate',
      disabled: isEditing,
      placeholder: t('Start date'),
      minDate,
    },
    {
      component: Calendar,
      type: 'date',
      name: 'endDate',
      disabled: isEditing,
      placeholder: t('End date'),
      minDate,
    },
    {
      component: TimePicker,
      name: 'startTime',
      disabled: isEditing,
      placeholder: t('Time'),
    },
    {
      component: AutoComplete,
      name: 'frequency',
      placeholder: t('Repeat'),
      options: triggerFrequencyOptions,
      optionLabel: 'label',
      disabled: isEditing,
      valueElementName: 'value',
      multiple: false,
      textFieldProps: {
        label: t('Repeat'),
        variant: 'outlined',
      },
      onChange: handleFrequencyChange,
    },
    {
      component: AutoComplete,
      name: 'frequencyValues',
      placeholder: frequencyPlaceholder,
      options: frequencyOptions,
      disabled: isEditing || daysDisabled,
      optionLabel: 'label',
      textFieldProps: {
        label: frequencyPlaceholder,
        variant: 'outlined',
      },
      helperText:
        frequency === 'monthly' &&
        t(
          'If you are selecting end of the month dates, then for the ones not present i.e. 30, 31, the selection will default to the last day of that month.'
        ),
    },
    {
      component: AutoComplete,
      name: 'groupId',
      placeholder: t('Select collection'),
      options: collections.groups,
      multiple: false,
      disabled: isEditing,
      optionLabel: 'label',
      textFieldProps: {
        label: t('Select collection'),
        variant: 'outlined',
      },
    },
  ];

  const setStates = ({
    days: daysValue,
    hours: hoursValue,
    endDate: endDateValue,
    flow: flowValue,
    frequency: frequencyValue,
    group: groupValue,
    isActive: isActiveValue,
    isRepeating: isRepeatingValue,
    startAt: startAtValue,
    roles: rolesValue,
  }: any) => {
    setIsRepeating(isRepeatingValue);
    setIsActive(isActiveValue);
    setEndDate(endDateValue);

    const { values, options, placeholder } = getFrequencyDetails(
      frequencyValue,
      daysValue,
      hoursValue
    );
    setFrequencyValues(values);
    setFrequencyOptions(options);
    setFrequencyPlaceholder(placeholder);

    setStartDate(startAtValue);
    // If a user wants to update the trigger
    if (moment().utc().isAfter(startAtValue, 'days')) {
      setMinDate(startAtValue);
    }
    setStartTime(moment(startAtValue).format('THH:mm:ss'));
    setfrequency(triggerFrequencyOptions.filter((trigger) => trigger.value === frequencyValue)[0]);
    setDaysDisabled(frequencyValue !== 'weekly' && frequencyValue !== 'monthly');

    setRoles(rolesValue);

    const getFlowId = flow.flows.filter((flows: any) => flows.id === flowValue.id);
    const getcollectionId = collections.groups.filter(
      (collection: any) => collection.id === groupValue.id
    );
    if (getFlowId.length > 0) {
      setFlowId(getFlowId[0]);
    }
    if (getcollectionId.length > 0) {
      setGroupId(getcollectionId[0]);
    }
  };

  return (
    <FormLayout
      {...queries}
      states={states}
      roleAccessSupport
      setStates={setStates}
      setPayload={(payload: any) => setPayload(payload, roles)}
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
    />
  );
};

export default Trigger;
