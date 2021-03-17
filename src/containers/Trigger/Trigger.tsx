import React, { useState } from 'react';
import * as Yup from 'yup';
import { useQuery } from '@apollo/client';
import { Typography } from '@material-ui/core';
import moment from 'moment';
import { useLocation } from 'react-router-dom';

import styles from './Trigger.module.css';

import { FormLayout } from '../Form/FormLayout';
import { ReactComponent as TriggerIcon } from '../../assets/images/icons/Trigger/Union.svg';
import { AutoComplete } from '../../components/UI/Form/AutoComplete/AutoComplete';
import { Loading } from '../../components/UI/Layout/Loading/Loading';
import { dayList, FLOW_STATUS_PUBLISHED, setVariables } from '../../common/constants';
import { TimePicker } from '../../components/UI/Form/TimePicker/TimePicker';
import { Calendar } from '../../components/UI/Form/Calendar/Calendar';
import { Checkbox } from '../../components/UI/Form/Checkbox/Checkbox';
import { GET_FLOWS } from '../../graphql/queries/Flow';
import { GET_COLLECTIONS } from '../../graphql/queries/Collection';
import { GET_TRIGGER } from '../../graphql/queries/Trigger';
import { CREATE_TRIGGER, DELETE_TRIGGER, UPDATE_TRIGGER } from '../../graphql/mutations/Trigger';

export interface TriggerProps {
  match: any;
}

const triggerFrequency = [
  { label: 'Does not repeat', value: 'none' },
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
];

const FormSchema = Yup.object().shape({
  flowId: Yup.object().nullable().required('Flow is required'),
  startTime: Yup.string().required('Time is required.'),
  startDate: Yup.string().nullable().required('Start date is required'),
  endDate: Yup.string()
    .nullable()
    .required('End date is required')
    .when('startDate', (startDate: any, schema: any) =>
      schema.test({
        test: (endDate: any) => startDate && moment(endDate).isAfter(startDate, 'days'),
        message: 'End date should be greater than the start date',
      })
    ),
  days: Yup.array()
    .nullable()
    .when('frequency', {
      is: (frequency: any) => frequency && frequency.value === 'weekly',
      then: Yup.array().min(1),
    }),
  frequency: Yup.object().nullable().required('Frequency is a required'),
  groupId: Yup.object().nullable().required('Collection is required'),
});

const dialogMessage = "You won't be able to use this for tagging messages.";

const triggerIcon = <TriggerIcon className={styles.TriggerIcon} />;

const queries = {
  getItemQuery: GET_TRIGGER,
  createItemQuery: CREATE_TRIGGER,
  updateItemQuery: UPDATE_TRIGGER,
  deleteItemQuery: DELETE_TRIGGER,
};

export const Trigger: React.SFC<TriggerProps> = ({ match }) => {
  const [flowId, setFlowId] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [startTime, setStartTime] = useState('');
  const [startDate, setStartDate] = useState('');
  const [frequency, setfrequency] = useState<any>('');
  const [endDate, setEndDate] = useState('');
  const [isRepeating, setIsRepeating] = useState('');
  const [days, setDays] = useState([]);
  const [daysDisabled, setDaysDisabled] = useState(true);
  const [groupId, setGroupId] = useState<any>('');
  const location = useLocation();

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

  const formFields = [
    {
      component: Checkbox,
      name: 'isActive',
      title: (
        <Typography variant="h6" className={styles.IsActive}>
          Is active?
        </Typography>
      ),
    },
    {
      component: AutoComplete,
      name: 'flowId',
      options: flow.flows,
      optionLabel: 'name',
      multiple: false,
      textFieldProps: {
        variant: 'outlined',
        label: 'Select flow',
      },
    },
    {
      component: Calendar,
      type: 'date',
      name: 'startDate',
      placeholder: 'Start date',
    },
    {
      component: Calendar,
      type: 'date',
      name: 'endDate',
      placeholder: 'End date',
    },
    {
      component: TimePicker,
      name: 'startTime',
      placeholder: 'Time',
    },
    {
      component: AutoComplete,
      name: 'frequency',
      placeholder: 'Repeat',
      options: triggerFrequency,
      optionLabel: 'label',
      multiple: false,
      textFieldProps: {
        label: 'Repeat',
        variant: 'outlined',
      },
      onChange: (value: any) => {
        if (value && value.value === 'weekly') {
          setDaysDisabled(false);
        } else {
          setDaysDisabled(true);
        }
      },
    },
    {
      component: AutoComplete,
      name: 'days',
      placeholder: 'Select days',
      options: dayList,
      disabled: daysDisabled,
      optionLabel: 'label',
      textFieldProps: {
        label: 'Select days',
        variant: 'outlined',
      },
    },
    {
      component: AutoComplete,
      name: 'groupId',
      placeholder: 'Select collection',
      options: collections.groups,
      multiple: false,
      optionLabel: 'label',
      textFieldProps: {
        label: 'Select collection',
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
    setDays(dayList.filter((day: any) => daysValue.includes(day.id)));
    setStartDate(moment(startAtValue).format('yyyy-MM-DD'));
    setStartTime(moment(startAtValue).format('HH:mm:ss'));
    setfrequency(triggerFrequency.filter((trigger) => trigger.value === frequencyValue)[0]);
    setDaysDisabled(frequencyValue !== 'weekly');
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
      startTime: moment(startAt).utc().format('Thh:mm:ss'),
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
      copyNotification="Copy of the trigger has been created!"
      icon={triggerIcon}
      customStyles={styles.Triggers}
    />
  );
};
