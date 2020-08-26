import React, { useState } from 'react';
import styles from './OrganisationSettings.module.css';
import * as Yup from 'yup';
import { Input } from '../../components/UI/Form/Input/Input';
import { FormLayout } from '../Form/FormLayout';
import { GET_AUTOMATIONS } from '../../graphql/queries/Automation';
import { GET_COLLECTION } from '../../graphql/queries/Collection';
import {
  CREATE_COLLECTION,
  UPDATE_COLLECTION,
  DELETE_COLLECTION,
} from '../../graphql/mutations/Collection';
import { ReactComponent as Collectionicon } from '../../assets/images/icons/Collections/Selected.svg';
import { Checkbox } from '../../components/UI/Form/Checkbox/Checkbox';
import { TimePicker } from '../../components/UI/Form/TimePicker/TimePicker';
import { useQuery } from '@apollo/client';
import { Loading } from '../../components/UI/Layout/Loading/Loading';
import { AutoComplete } from '../../components/UI/Form/AutoComplete/AutoComplete';

export interface SettingsProps {
  match: any;
}

const FormSchema = Yup.object().shape({
  shortcode: Yup.string().required('Title is required.'),
  label: Yup.string().required('Description is required.'),
});

const collectionIcon = <Collectionicon className={styles.Collectionicon} />;

const queries = {
  getItemQuery: GET_COLLECTION,
  createItemQuery: CREATE_COLLECTION,
  updateItemQuery: UPDATE_COLLECTION,
  deleteItemQuery: DELETE_COLLECTION,
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
  const [shortcode, setShortcode] = useState('');
  const [label, setLabel] = useState('');
  const [hours, setHours] = useState(false);
  const [days, setDays] = useState([]);
  const [flow, setFlow] = useState([]);
  const [IsDisabled, setIsDisable] = useState(false);

  const states = { shortcode, label, hours, days, flow };
  const setStates = ({ shortcode, label, hours }: any) => {
    setShortcode(shortcode);
    setLabel(label);
    setHours(hours);
  };

  const { data } = useQuery(GET_AUTOMATIONS);

  if (!data) return <Loading />;

  const handleChange = (value: any) => {
    setIsDisable(!value);
  };

  const formFields = [
    {
      component: Input,
      name: 'organisation',
      type: 'text',
      placeholder: 'Organisation name',
    },
    {
      component: Input,
      name: 'api',
      type: 'text',
      placeholder: 'Gupshup API key',
    },
    {
      component: Input,
      name: 'whatsapp',
      type: 'text',
      placeholder: 'Gupshup WhatsApp number',
    },
    {
      component: Checkbox,
      name: 'hours',
      label: 'Hours of operations',
      handleChange: handleChange,
    },
    {
      component: TimePicker,
      name: 'Opens',
      placeholder: 'Opens',
      disabled: IsDisabled,
    },
    {
      component: TimePicker,
      name: 'Closes',
      placeholder: 'Closes',
      disabled: IsDisabled,
    },
    {
      component: AutoComplete,
      name: 'days',
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
      name: 'flow',
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

  return (
    <FormLayout
      {...queries}
      match={{ params: { id: null } }}
      states={states}
      setStates={setStates}
      validationSchema={FormSchema}
      listItemName="Settings"
      dialogMessage={''}
      formFields={formFields}
      redirectionLink="settings"
      cancelLink="settings"
      linkParameter="id"
      listItem="savedSearch"
      icon={collectionIcon}
      languageSupport={false}
    />
  );
};
