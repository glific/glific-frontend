import React from 'react';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import styles from './ConsultingList.module.css';
import { List } from '../../List/List';
import { setVariables } from '../../../common/constants';
import {
  GET_CONSULTING_HOURS,
  GET_CONSULTING_HOURS_COUNT,
} from '../../../graphql/queries/Consulting';
import { DELETE_CONSULTING_HOURS } from '../../../graphql/mutations/Consulting';
import { ReactComponent as OrganisationIcon } from '../../../assets/images/icons/Organisation.svg';

const ConsultingList = () => {
  const { t } = useTranslation();

  const queries = {
    countQuery: GET_CONSULTING_HOURS_COUNT,
    filterItemsQuery: GET_CONSULTING_HOURS,
    deleteItemQuery: DELETE_CONSULTING_HOURS,
  };

  const columnNames = ['NAME', 'DATE', 'MINUTES', 'TYPE', 'ACTIONS'];

  const getName = (label: string) => (
    <div className={styles.LabelContainer}>
      <p className={styles.LabelText}>{label}</p>
    </div>
  );

  const getOtherColumn = (label: any, isDate: boolean = false) => {
    const text = isDate ? moment(label).format('DD MMM YYYY') : label;
    return (
      <div>
        <p className={styles.StatusText}>{text}</p>
      </div>
    );
  };

  const getBillableColumn = (isBillable: boolean) => {
    const text = isBillable ? t('Billable') : t('Non-Billable');
    return (
      <div>
        <p className={styles.StatusText}>{text}</p>
      </div>
    );
  };

  const getColumns = ({ organizationName, duration, when, isBillable }: any) => ({
    organizationName: getName(organizationName),
    when: getOtherColumn(when, true),
    duration: getOtherColumn(duration),
    isBillable: getBillableColumn(isBillable),
  });

  const columnAttributes = {
    columnNames,
    columns: getColumns,
    columnStyles: [styles.Label, styles.Status, styles.Status, styles.Status, styles.Actions],
  };

  const listIcon = <OrganisationIcon className={styles.ConsultingHoursIcon} />;
  const dialogueMessage = 'This cannot be undone. Do you want to continue?';

  const addNewButton = {
    show: true,
    label: 'Add Hours',
  };

  return (
    <List
      title={t('Consulting')}
      listItem="consultingHours"
      listItemName="consultingHour"
      pageLink="consulting-hours"
      listIcon={listIcon}
      refetchQueries={{
        query: GET_CONSULTING_HOURS,
        variables: setVariables(),
      }}
      searchParameter="organizationName"
      dialogMessage={dialogueMessage}
      button={addNewButton}
      {...queries}
      {...columnAttributes}
    />
  );
};

export default ConsultingList;
