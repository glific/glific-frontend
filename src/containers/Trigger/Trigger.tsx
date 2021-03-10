// @ts-nocheck
/* eslint-disable */

import React, { useState, useEffect } from 'react';
import * as Yup from 'yup';
import { useQuery, useLazyQuery } from '@apollo/client';
import { Typography } from '@material-ui/core';
import moment from 'moment';

import styles from './Trigger.module.css';

import { FILTER_TAGS_NAME, GET_TAG, GET_TAGS } from '../../graphql/queries/Tag';
import { UPDATE_TAG, CREATE_TAG, DELETE_TAG } from '../../graphql/mutations/Tag';
import { FormLayout } from '../Form/FormLayout';
import { ReactComponent as TagIcon } from '../../assets/images/icons/Tags/Selected.svg';
import { AutoComplete } from '../../components/UI/Form/AutoComplete/AutoComplete';
import { Loading } from '../../components/UI/Layout/Loading/Loading';
import { dayList, FLOW_STATUS_PUBLISHED, setVariables } from '../../common/constants';
import { getObject } from '../../common/utils';
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
  startTime: Yup.string().required('Description is required.'),
  startDate: Yup.string().nullable().required('Start date is required'),
  frequency: Yup.object().nullable().required('This is a required field'),
  groupId: Yup.object().nullable().required('Collection is required'),
});

const dialogMessage = "You won't be able to use this for tagging messages.";

const tagIcon = <TagIcon className={styles.TagIcon} />;

const queries = {
  getItemQuery: GET_TRIGGER,
  createItemQuery: CREATE_TRIGGER,
  updateItemQuery: UPDATE_TRIGGER,
  deleteItemQuery: DELETE_TRIGGER,
};

export const Trigger: React.SFC<TriggerProps> = ({ match }) => {
  const [flowId, setFlowId] = useState({});
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState();
  const [startDate, setStartDate] = useState();
  const [frequency, setfrequency] = useState({});
  const [endDate, setEndDate] = useState();
  const [isRepeating, setIsRepeating] = useState('');
  const [days, setDays] = useState([]);
  const [daysDisabled, setDaysDisabled] = useState(true);
  const [groupId, setGroupId] = useState<any>({});

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

  const { data: flow } = useQuery(GET_FLOWS, {
    variables: setVariables({
      status: FLOW_STATUS_PUBLISHED,
    }),
    fetchPolicy: 'network-only', // set for now, need to check cache issue
  });

  const { data: collections } = useQuery(GET_COLLECTIONS, {
    variables: setVariables(),
  });

  const { data } = useQuery(GET_TAGS, {
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
      placeholder: 'Starting date',
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
      onChange: (value) => {
        if (value.value === 'weekly') {
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
      placeholder: 'Select collections',
      options: collections.groups,
      multiple: false,
      optionLabel: 'label',
      textFieldProps: {
        label: 'Select collections',
        variant: 'outlined',
      },
    },
  ];

  const setStates = ({
    days: daysValue,
    endDate,
    flow: flowValue,
    frequency: frequencyValue,
    group,
    isActive,
    isRepeating,
    startAt,
  }: any) => {
    setIsRepeating(isRepeating);
    setIsActive(isActive);
    setEndDate(moment(endDate).format('yyyy-MM-DD'));
    setDays(dayList.filter((day) => daysValue.includes(day.id)));
    setStartDate(moment(startAt).format('yyyy-MM-DD'));
    setStartTime(moment(startAt).format('Thh:mm:ss'));
    setfrequency(triggerFrequency.filter((trigger) => trigger.value === frequencyValue)[0]);
    setDaysDisabled(frequencyValue !== 'weekly');
    setFlowId(flow.flows.filter((flow) => flow.id === flowValue.id)[0]);
    setGroupId(collections.groups.filter((collection) => collection.id === group.id)[0]);
  };

  const setPayload = (payload: any) => {
    const payloadCopy = payload;
    const newPayload = {
      isActive: payloadCopy.isActive,
      isRepeating: true,
      flowId: payloadCopy.flowId.id,
      days: payloadCopy.days.map((day) => day.id),
      groupId: payloadCopy.groupId.id,
      startDate: moment(payloadCopy.startDate).format('yyyy-MM-DD'),
      endDate: moment(payloadCopy.endDate).format('yyyy-MM-DD'),
      startTime: payloadCopy.startTime,
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
      icon={tagIcon}
      customStyles={styles.Triggers}
    />
  );
};
