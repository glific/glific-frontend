import React, { useState } from 'react';
import * as Yup from 'yup';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
import moment from 'moment';

import styles from './Consulting.module.css';
import { Input } from '../../components/UI/Form/Input/Input';
import { AutoComplete } from '../../components/UI/Form/AutoComplete/AutoComplete';
import { RadioInput } from '../../components/UI/Form/RadioInput/RadioInput';
import { Loading } from '../../components/UI/Layout/Loading/Loading';
import { FormLayout } from '../Form/FormLayout';
import { GET_CONSULTING_HOURS_BY_ID, GET_CONSULTING_HOURS } from '../../graphql/queries/Consulting';
import {
  CREATE_CONSULTING_HOUR,
  UPDATE_CONSULTING_HOURS,
  DELETE_CONSULTING_HOURS,
} from '../../graphql/mutations/Consulting';
import { FILTER_ORGANIZATIONS } from '../../graphql/queries/Organization';
import { setVariables } from '../../common/constants';

export interface ConsultingProps {
  match: any;
}

export const Consulting: React.SFC<ConsultingProps> = ({ match }) => {
  const { t } = useTranslation();
  const [participants, setParticipants] = useState('');
  const [staff, setStaff] = useState('');
  const [when, setWhen] = useState<any>(null);
  const [duration, setDuration] = useState(0);
  const [content, setContent] = useState('');
  const [isBillable, setIsBillable] = useState(false);
  const [organization, setOrganization] = useState<any>(null);

  const states = {
    participants,
    staff,
    when,
    duration,
    content,
    isBillable,
    organization,
  };

  const setStates = ({
    participants: supportMembers,
    staff: staffMembers,
    when: consultingDate,
    duration: durationInMin,
    content: description,
    isBillable: billable,
    organization: org,
  }: any) => {
    setParticipants(supportMembers);
    setStaff(staffMembers);
    setWhen(consultingDate);
    setDuration(durationInMin);
    setContent(description);
    setIsBillable(billable);
    setOrganization(org);
  };

  const { data: organizationList } = useQuery(FILTER_ORGANIZATIONS, {
    variables: setVariables(),
  });

  if (!organizationList) {
    return <Loading />;
  }

  const FormSchema = Yup.object().shape({
    participants: Yup.string().required(t('Participants are required.')),
    staff: Yup.string().required(t('NGO staff members are required.')),
    content: Yup.string().required(t('Description is required')),
    when: Yup.date().nullable().required(t('Date is required.')),
    duration: Yup.number()
      .moreThan(0, 'Duration should be greater than 0')
      .required(t('Duration is required')),
    isBillable: Yup.boolean(),
    organization: Yup.object().nullable().required('Organization is required'),
  });

  const queries: any = {
    getItemQuery: GET_CONSULTING_HOURS_BY_ID,
    createItemQuery: CREATE_CONSULTING_HOUR,
    updateItemQuery: UPDATE_CONSULTING_HOURS,
    deleteItemQuery: DELETE_CONSULTING_HOURS,
  };

  const formFields = (organizationOptions: Array<any>) => [
    {
      component: Input,
      name: 'participants',
      type: 'text',
      placeholder: t('Support members'),
      inputProp: {
        onChange: (event: any) => setParticipants(event.target.value),
      },
    },
    {
      component: Input,
      name: 'staff',
      type: 'text',
      placeholder: t('NGO staff members'),
      inputProp: {
        onChange: (event: any) => setStaff(event.target.value),
      },
    },
    {
      component: AutoComplete,
      name: 'organization',
      placeholder: t('Organization'),
      options: organizationOptions,
      optionLabel: 'name',
      multiple: false,
      textFieldProps: {
        label: t('Organization'),
        variant: 'outlined',
      },
      onChange: (val: any) => setOrganization(val),
    },
    {
      component: Input,
      name: 'content',
      type: 'text',
      rows: 3,
      textArea: true,
      placeholder: t('Description'),
      inputProp: {
        onChange: (event: any) => setContent(event.target.value),
      },
    },
    {
      component: Input,
      name: 'when',
      type: 'date',
      placeholder: t('Date'),
      inputProp: {
        onChange: (event: any) => setWhen(event.target.value),
      },
    },
    {
      component: Input,
      name: 'duration',
      type: 'text',
      placeholder: t('Duration'),
      validate: (val: any) => {
        let error: any;
        if (val % 15 !== 0) {
          error = 'Duration should be in multiple of 15';
        }
        return error;
      },
      inputProp: {
        onChange: (event: any) => setDuration(Number(event.target.value)),
      },
    },
    {
      component: RadioInput,
      radioButtons: ['Billable', 'Non-Billable'],
      handleChange: (event: any) => {
        const radioValue: string = event.target.value;
        let value: boolean = false;
        if (radioValue === 'Billable') value = true;
        setIsBillable(value);
      },
    },
  ];

  const dialogMessage = t("You won't be able to use this for tagging messages.");
  const consultHourIcon = <HourglassEmptyIcon className={styles.ConsultingIcon} />;

  const setPayload = (payload: any) => {
    const data = { ...payload };
    if (data.organization) {
      delete data.organization;
    }

    // Setting date to appropriate format
    data.when = moment(when).toISOString();

    if (organization) {
      data.organizationId = Number(organization.id);
      data.organizationName = organization.name;
    }
    return data;
  };

  const orgOptions = organizationList.organizations;
  return (
    <FormLayout
      {...queries}
      title={t('Consulting Hours')}
      listItem="consultingHours"
      listItemName="consultingHour"
      pageLink="consultingHour"
      match={match}
      refetchQueries={[
        {
          query: GET_CONSULTING_HOURS,
          variables: setVariables(),
        },
      ]}
      states={states}
      setStates={setStates}
      setPayload={setPayload}
      validationSchema={FormSchema}
      dialogMessage={dialogMessage}
      formFields={formFields(orgOptions)}
      redirectionLink="consulting-hours"
      icon={consultHourIcon}
      languageSupport={false}
    />
  );
};

export default Consulting;
