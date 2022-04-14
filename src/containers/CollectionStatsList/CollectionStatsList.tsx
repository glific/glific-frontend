import React, { useState } from 'react';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import { List } from 'containers/List/List';

import { GET_CONSULTING_HOURS, GET_CONSULTING_HOURS_COUNT } from 'graphql/queries/Consulting';
import { ReactComponent as ConsultingIcon } from 'assets/images/icons/icon-consulting.svg';

import styles from './CollectionStatsList.module.css';

interface CollectionStatsListProps {}

const CollectionStatsList: React.SFC<CollectionStatsListProps> = () => {
  const { t } = useTranslation();

  const [filters] = useState({});

  const queries = {
    countQuery: GET_CONSULTING_HOURS_COUNT,
    filterItemsQuery: GET_CONSULTING_HOURS,
    deleteItemQuery: null,
  };

  const columnNames = ['NAME'];

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

  const getStaffColumn = (staff: any) => (
    <div>
      <p className={styles.StatusText}>{staff}</p>
    </div>
  );

  const getColumns = ({ organizationName, duration, when, isBillable, staff }: any) => ({
    organizationName: getName(organizationName),
    when: getOtherColumn(when, true),
    duration: getOtherColumn(duration),
    isBillable: getBillableColumn(isBillable),
    staff: getStaffColumn(staff),
  });

  const columnAttributes = {
    columnNames,
    columns: getColumns,
    columnStyles: [styles.Label],
  };

  const listIcon = <ConsultingIcon className={styles.ConsultingHoursIcon} />;
  const dialogMessage = t('This action cannot be undone.');
  const dialogTitle = t('Are you sure you want to delete this consulting record?');

  const restrictedAction = () => ({ delete: false, edit: false });

  return (
    <List
      defaultSortBy="DATE"
      listOrder="desc"
      title={t('Consulting')}
      listItem="consultingHours"
      listItemName="consultingHour"
      pageLink="consulting-hours"
      listIcon={listIcon}
      button={{
        show: false,
      }}
      filters={filters}
      restrictedAction={restrictedAction}
      searchParameter={['organizationName']}
      dialogMessage={dialogMessage}
      dialogTitle={dialogTitle}
      noItemText="consulting record"
      customStyles={styles.Body}
      {...queries}
      {...columnAttributes}
    />
  );
};

export default CollectionStatsList;
