// @ts-nocheck
/* eslint-disable */

import React, { useState, useEffect } from 'react';
import * as Yup from 'yup';
import { useQuery, useLazyQuery } from '@apollo/client';
import { Typography } from '@material-ui/core';

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

const frequency = [{ label: 'Does not repeat' }, { label: 'Daily' }, { label: 'Weekly' }];

// const FormSchema = Yup.object().shape({
//   label: Yup.string().required('Title is required.').max(50, 'Title is too long.'),
//   description: Yup.string().required('Description is required.'),
// });

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
  const [startTime, setStartTime] = useState();
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [repeat, setRepeat] = useState('');
  const [days, setDays] = useState([]);
  const [groupId, setGroupId] = useState<any>([]);

  const states = { flowId, startTime, startDate, endDate, repeat, days, groupId };

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
        <Typography variant="h6" style={{ color: '#073f24' }}>
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
        label: 'Select default flow',
      },

      helperText:
        'the selected flow will be triggered for messages received outside hours of operations',
    },
    {
      component: Calendar,
      name: 'startDate',
      placeholder: 'Opens',
    },
    {
      component: Calendar,
      name: 'endDate',
      placeholder: 'Closes',
    },
    {
      component: TimePicker,
      name: 'startTime',
      placeholder: 'Opens',
    },
    {
      component: AutoComplete,
      name: 'parentId',
      placeholder: 'Repeat',
      options: frequency,
      optionLabel: 'label',
      multiple: false,
      textFieldProps: {
        label: 'Repeat',
        variant: 'outlined',
      },
    },
    {
      component: AutoComplete,
      name: 'days',
      placeholder: 'Select days',
      options: dayList,
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
      optionLabel: 'label',
      textFieldProps: {
        label: 'Select collections',
        variant: 'outlined',
      },
    },
  ];

  const setStates = (props: any) => {
    console.log(props);
  };

  let tags = [];
  if (data) {
    tags = data.tags;
    // remove the self tag from list
    if (data && match && match.params.id) {
      tags = data.tags.filter((tag: any) => tag.id !== match.params.id);
    }
  }

  const setPayload = (payload: any) => {
    const payloadCopy = payload;

    console.log(payloadCopy);
    return payloadCopy;
  };

  return (
    <FormLayout
      {...queries}
      match={match}
      states={states}
      setStates={setStates}
      setPayload={setPayload}
      // validationSchema={FormSchema}
      languageSupport={false}
      listItemName="trigger"
      dialogMessage={dialogMessage}
      formFields={formFields}
      redirectionLink="trigger"
      listItem="trigger"
      icon={tagIcon}
    />
  );
};
