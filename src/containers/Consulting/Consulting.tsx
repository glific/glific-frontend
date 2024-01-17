import { useState } from 'react';
import * as Yup from 'yup';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

import { Input } from 'components/UI/Form/Input/Input';
import { DateTimePicker } from 'components/UI/Form/DateTimePicker/DateTimePicker';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { RadioInput } from 'components/UI/Form/RadioInput/RadioInput';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { FormLayout } from 'containers/Form/FormLayout';
import ConsultingIcon from 'assets/images/icons/icon-consulting.svg?react';
import { GET_CONSULTING_HOURS_BY_ID, GET_CONSULTING_HOURS } from 'graphql/queries/Consulting';
import {
  CREATE_CONSULTING_HOUR,
  UPDATE_CONSULTING_HOURS,
  DELETE_CONSULTING_HOURS,
} from 'graphql/mutations/Consulting';
import { FILTER_ORGANIZATIONS } from 'graphql/queries/Organization';
import { setVariables } from 'common/constants';
import styles from './Consulting.module.css';

export interface ConsultingProps {
  organizationId: String;
  setOpenDialog: Function;
}

const isDurationValid = (value: any) => value % 15 === 0;

export const Consulting = ({ organizationId, setOpenDialog }: ConsultingProps) => {
  const { t } = useTranslation();
  const [participants, setParticipants] = useState('');
  const [staff, setStaff] = useState('');
  const [when, setWhen] = useState<any>(dayjs());
  const [duration, setDuration] = useState<number>(0);
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
    setWhen(dayjs(consultingDate));
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
      .moreThan(0, t('Duration should be greater than 0'))
      .test('is duration valid?', t('Duration should be in multiple of 15'), isDurationValid)
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
      options: organizationOptions,
      optionLabel: 'name',
      multiple: false,
      label: t('Select Organization'),
      onChange: (val: any) => setOrganization(val),
    },
    {
      component: Input,
      name: 'participants',
      type: 'text',
      label: t('Participants'),
      inputProp: {
        onChange: (event: any) => setParticipants(event.target.value),
      },
    },
    {
      component: DateTimePicker,
      name: 'when',
      label: t('Select date'),
      onChange: (val: any) => setWhen(val),

    },
    {
      component: Input,
      name: 'duration',
      type: 'text',
      label: t('Enter time (in mins)'),
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
      label: t('Support team'),
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
      label: t('Notes'),
      inputProp: {
        onChange: (event: any) => setContent(event.target.value),
      },
    },
  ];

  const dialogMessage = t('This action cannot be undone.');
  const consultHourIcon = <ConsultingIcon className={styles.ConsultingIcon} />;

  const setPayload = (payload: any) => {
    const data = { ...payload };
    if (data.organization) {
      delete data.organization;
    }

    // Setting date to appropriate format
    data.when = dayjs(when).toISOString();

    if (organization) {
      data.clientId = Number(organization.id);
      data.organizationName = organization.name;
    }

    return data;
  };

  const orgOptions = organizationList.organizations;

  return (
    <div className={`${styles.Layout} ${organizationId ? styles.Edit : ''}`}>
      <FormLayout
        {...queries}
        title={t('Add consulting record')}
        listItem="consultingHour"
        listItemName="Consulting hours"
        pageLink="consultingHour"
        refetchQueries={[
          {
            query: GET_CONSULTING_HOURS,
            variables: {
              filter: {},
              opts: {
                limit: 50,
                offset: 0,
                order: 'DESC',
                orderWith: 'when',
              },
            },
          },
        ]}
        afterSave={() => setOpenDialog(false)}
        cancelAction={() => setOpenDialog(false)}
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
        entityId={organizationId}
      />
    </div>
  );
};

export default Consulting;
