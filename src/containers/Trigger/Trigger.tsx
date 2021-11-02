import React, { useState } from 'react';
import * as Yup from 'yup';
import { useQuery } from '@apollo/client';
import { Typography } from '@material-ui/core';
import moment from 'moment';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { ReactComponent as TriggerIcon } from 'assets/images/icons/Trigger/Union.svg';
import { dateList, dayList, FLOW_STATUS_PUBLISHED, setVariables } from 'common/constants';
import { FormLayout } from 'containers/Form/FormLayout';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { TimePicker } from 'components/UI/Form/TimePicker/TimePicker';
import { Calendar } from 'components/UI/Form/Calendar/Calendar';
import { Checkbox } from 'components/UI/Form/Checkbox/Checkbox';
import { GET_FLOWS } from 'graphql/queries/Flow';
import { GET_COLLECTIONS } from 'graphql/queries/Collection';
import { GET_TRIGGER } from 'graphql/queries/Trigger';
import { CREATE_TRIGGER, DELETE_TRIGGER, UPDATE_TRIGGER } from 'graphql/mutations/Trigger';
import styles from './Trigger.module.css';

export interface TriggerProps {
  match: any;
}
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

export const Trigger: React.SFC<TriggerProps> = ({ match }) => {
  let isEditing = false;
  if (match.params.id) {
    isEditing = true;
  }

  const [flowId, setFlowId] = useState(null);
  const [isActive, setIsActive] = useState(true);
  const [startTime, setStartTime] = useState('');
  const [startDate, setStartDate] = useState('');
  const [frequency, setfrequency] = useState<any>(null);
  const [endDate, setEndDate] = useState('');
  const [isRepeating, setIsRepeating] = useState('');
  const [days, setDays] = useState([]);
  const [daysDisabled, setDaysDisabled] = useState(true);
  const [groupId, setGroupId] = useState<any>(null);
  const [minDate, setMinDate] = useState<any>(new Date());
  const [monthly, setMonthly] = useState(false);

  const location = useLocation();
  const { t } = useTranslation();
  const states = {
    flowId,
    startTime,
    startDate,
    frequency,
    endDate,
    isRepeating,
    days,
    groupId,
    isActive,
  };

  const triggerFrequencyOptions = [
    { label: t('Does not repeat'), value: 'none' },
    { label: t('Daily'), value: 'daily' },
    { label: t('Weekly'), value: 'weekly' },
    { label: t('Monthly'), value: 'monthly' },
  ];

  const FormSchema = Yup.object().shape({
    flowId: Yup.object().nullable().required(t('Flow is required')),
    startTime: Yup.string()
      .required(t('Time is required.'))
      .when('startDate', (startDateValue: any, schema: any) =>
        schema.test({
          test: (startAtValue: any) => checkDateTimeValidation(startAtValue, startDateValue),
          message: t('Start time should be greater than current time'),
        })
      ),
    startDate: Yup.string().nullable().required(t('Start date is required')),

    endDate: Yup.string()
      .nullable()
      .required(t('End date is required'))
      .when('startDate', (startDateValue: any, schema: any) =>
        schema.test({
          test: (endDateValue: any) =>
            startDateValue && moment(endDateValue).isAfter(startDateValue),
          message: t('End date should be greater than the start date'),
        })
      ),

    days: Yup.array()
      .nullable()
      .when('frequency', {
        is: (frequencyValue: any) => frequencyValue && frequencyValue.value === 'weekly',
        then: Yup.array().min(1, t('Please select a day')),
      }),
    frequency: Yup.object().nullable().required(t('Repeat is required')),
    groupId: Yup.object().nullable().required(t('Collection is required')),
  });

  const dialogMessage = t("You won't be able to use this for tagging messages.");

  const triggerIcon = <TriggerIcon className={styles.TriggerIcon} />;

  const queries = {
    getItemQuery: GET_TRIGGER,
    createItemQuery: CREATE_TRIGGER,
    updateItemQuery: UPDATE_TRIGGER,
    deleteItemQuery: DELETE_TRIGGER,
  };

  let type;

  if (location.state === 'copy') {
    queries.updateItemQuery = CREATE_TRIGGER;
    type = 'copy';
  } else {
    queries.updateItemQuery = UPDATE_TRIGGER;
  }

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
    if (value === 'weekly') {
      setDaysDisabled(false);
      setMonthly(false);
    } else if (value === 'monthly') {
      setDaysDisabled(false);
      setMonthly(true);
    } else {
      setDaysDisabled(true);
      setMonthly(false);
    }
    setDays([]);
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
      name: 'days',
      placeholder: monthly ? t('Select date') : t('Select days'),
      options: monthly ? dateList : dayList,
      disabled: isEditing || daysDisabled,
      optionLabel: 'label',
      textFieldProps: {
        label: monthly ? t('Select dates') : t('Select days'),
        variant: 'outlined',
      },
      helperText: monthly
        ? t(
            'If you are selecting end of the month dates, then for the ones not present i.e. 30, 31, the selection will default to the last day of that month.'
          )
        : null,
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
    endDate: endDateValue,
    flow: flowValue,
    frequency: frequencyValue,
    group: groupValue,
    isActive: isActiveValue,
    isRepeating: isRepeatingValue,
    startAt: startAtValue,
  }: any) => {
    setIsRepeating(isRepeatingValue);
    setIsActive(isActiveValue);
    setEndDate(moment(endDateValue).format('yyyy-MM-DD'));
    let savedDays = dayList.filter((day: any) => daysValue.includes(day.id));
    if (frequencyValue === 'monthly') {
      setMonthly(true);
      savedDays = dateList.filter((day: any) => daysValue.includes(day.id));
    }
    setDays(savedDays);
    setStartDate(moment(startAtValue).format('yyyy-MM-DD'));
    // If a user wants to update the trigger
    if (moment(new Date()).isAfter(startAtValue, 'days')) {
      setMinDate(moment(startAtValue).format('yyyy-MM-DD'));
    }
    setStartTime(moment(startAtValue).format('THH:mm:ss'));
    setfrequency(triggerFrequencyOptions.filter((trigger) => trigger.value === frequencyValue)[0]);
    setDaysDisabled(frequencyValue !== 'weekly' && frequencyValue !== 'monthly');

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

  const setPayload = (payload: any) => {
    const payloadCopy = payload;

    // covert the time to UTC
    const startAt = moment(`
      ${moment(payloadCopy.startDate).format('yyyy-MM-DD')}${payloadCopy.startTime}`).utc();
    const newPayload = {
      isActive: payloadCopy.isActive,
      isRepeating: true,
      flowId: payloadCopy.flowId.id,
      days: payloadCopy.days.map((day: any) => day.id),
      groupId: payloadCopy.groupId.id,
      startDate: moment(startAt).utc().format('yyyy-MM-DD'),
      endDate: moment(payloadCopy.endDate).utc().format('yyyy-MM-DD'),
      startTime: moment(startAt).utc().format('THH:mm:ss'),
      frequency: payloadCopy.frequency.value,
    };

    if (newPayload.frequency === 'none') {
      newPayload.isRepeating = false;
      newPayload.days = [];
    } else if (newPayload.frequency === 'daily') {
      newPayload.days = [];
    }
    return newPayload;
  };

  return (
    <FormLayout
      {...queries}
      match={match}
      states={states}
      setStates={setStates}
      setPayload={setPayload}
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
