import React, { useState } from 'react';
import * as Yup from 'yup';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

import styles from './Consulting.module.css';
import { Input } from '../../components/UI/Form/Input/Input';
import { DateTimePicker } from '../../components/UI/Form/DateTimePicker/DateTimePicker';
import { AutoComplete } from '../../components/UI/Form/AutoComplete/AutoComplete';
import { RadioInput } from '../../components/UI/Form/RadioInput/RadioInput';
import { Loading } from '../../components/UI/Layout/Loading/Loading';
import { FormLayout } from '../Form/FormLayout';
import { ReactComponent as ConsultingIcon } from '../../assets/images/icons/icon-consulting.svg';
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

const isDurationValid = (value: any) => value % 15 === 0;

export const Consulting: React.SFC<ConsultingProps> = ({ match }) => {
  const { t } = useTranslation();
  const [participants, setParticipants] = useState('');
  const [staff, setStaff] = useState('');
  const [when, setWhen] = useState<any>(new Date());
  const [duration, setDuration] = useState<number>();
  const [content, setContent] = useState('');
  const [isBillable, setIsBillable] = useState<any>(null);
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

  const { data: organizationList } = useQuery(FILTER_ORGANIZATIONS, {
    variables: setVariables(),
  });

  if (!organizationList) {
    return <Loading />;
  }

  const setStates = ({
    participants: supportMembers,
    staff: staffMembers,
    when: consultingDate,
    duration: durationInMin,
    content: description,
    isBillable: billable,
    organization: org,
    organizationName,
  }: any) => {
    setParticipants(supportMembers);
    setStaff(staffMembers);
    setWhen(consultingDate);
    setDuration(durationInMin);
    setContent(description);
    setIsBillable(billable);
    /**
     * When edit organization is undefined
     * since we are getting organizationName,
     * we need to get object from organizationList for selected organizationName
     */
    if (!org) {
      const selectedOrg = organizationList.organizations.find(
        ({ name }: { name: string }) => name === organizationName
      );
      setOrganization(selectedOrg);
    } else setOrganization(org);
  };

  const FormSchema = Yup.object().shape({
    participants: Yup.string().required(t('Participants are required.')),
    staff: Yup.string().required(t('NGO staff members are required.')),
    content: Yup.string().required(t('Description is required')),
    when: Yup.date().nullable().required(t('Date is required and should be valid.')),
    duration: Yup.number()
      .nullable()
      .moreThan(0, 'Duration should be greater than 0')
      .test('is duration valid?', 'Duration should be in multiple of 15', isDurationValid)
      .required(t('Duration is required')),
    isBillable: Yup.boolean().nullable().required('Required'),
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
      component: AutoComplete,
      name: 'organization',
      placeholder: t('Select Organization'),
      options: organizationOptions,
      optionLabel: 'name',
      multiple: false,
      textFieldProps: {
        label: t('Select Organization'),
        variant: 'outlined',
      },
      onChange: (val: any) => setOrganization(val),
    },
    {
      component: Input,
      name: 'participants',
      type: 'text',
      placeholder: t('Participants'),
      inputProp: {
        onChange: (event: any) => setParticipants(event.target.value),
      },
    },
    {
      component: DateTimePicker,
      name: 'when',
      placeholder: t('Select date'),
      onChange: (val: any) => setWhen(val),
    },
    {
      component: Input,
      name: 'duration',
      type: 'text',
      placeholder: t('Enter time (in mins)'),
      inputProp: {
        onChange: (event: any) => setDuration(Number(event.target.value)),
      },
    },
    {
      component: RadioInput,
      name: 'isBillable',
      labelYes: 'Billable',
      labelNo: 'Non-Billable',
      handleChange: (value: boolean) => setIsBillable(value),
    },
    {
      component: Input,
      name: 'staff',
      type: 'text',
      placeholder: t('Support team'),
      inputProp: {
        onChange: (event: any) => setStaff(event.target.value),
      },
    },
    {
      component: Input,
      name: 'content',
      type: 'text',
      rows: 3,
      textArea: true,
      placeholder: t('Notes'),
      inputProp: {
        onChange: (event: any) => setContent(event.target.value),
      },
    },
  ];

  const dialogMessage = 'This action cannot be undone.';
  const consultHourIcon = <ConsultingIcon className={styles.ConsultingIcon} />;

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
    <div className={`${styles.Layout} ${match.params.id ? styles.Edit : ''}`}>
      <FormLayout
        {...queries}
        title={t('Add consulting record')}
        listItem="consultingHour"
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
        customStyles={[styles.Form]}
        type="consultingHours"
      />
    </div>
  );
};

export default Consulting;
