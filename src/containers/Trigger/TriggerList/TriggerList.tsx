import React from 'react';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { ReactComponent as TriggerIcon } from 'assets/images/icons/Trigger/Union.svg';
import { ReactComponent as ClockIcon } from 'assets/images/icons/Trigger/Clock.svg';
import { ReactComponent as ClockInactiveIcon } from 'assets/images/icons/Trigger/Inactive.svg';
import { ReactComponent as DuplicateIcon } from 'assets/images/icons/Flow/Duplicate.svg';
import { TRIGGER_LIST_QUERY, TRIGGER_QUERY_COUNT } from 'graphql/queries/Trigger';
import { DELETE_TRIGGER } from 'graphql/mutations/Trigger';
import { FULL_DATE_FORMAT, dayList } from 'common/constants';
import { List } from 'containers/List/List';
import { Tooltip } from 'components/UI/Tooltip/Tooltip';
import styles from './TriggerList.module.css';

const getTooltip = (frequency: any, days: any) => {
  const obj: any = [];

  days.forEach((option: number) => {
    dayList.forEach((value: any) => {
      if (value.id === option) {
        obj.push(value.label.slice(0, 3));
      }
    });
  });
  return `Repeat: ${frequency}${frequency === 'weekly' ? `(${obj.toString()})` : ''}`;
};

const getName = (flow: any, startAt: any, frequency: any, days: any, isActive: boolean) => (
  <p className={styles.LabelText}>
    <Tooltip title={getTooltip(frequency, days)} tooltipClass={styles.Tooltip} placement="right">
      <span className={styles.TriggerIcon}>{isActive ? <ClockIcon /> : <ClockInactiveIcon />}</span>
    </Tooltip>
    <span>{`${flow.name}_${moment(startAt).format('DD/MM/yyyy_hh:mmA')}`}</span>
  </p>
);

const getEndDate = (date: any) => (
  <div className={styles.EndDateVal}>{moment(date).format(FULL_DATE_FORMAT)}</div>
);

const getCollections = (group: any) => <div className={styles.Collection}>{group.label}</div>;

const getColumns = ({ endDate, group, frequency, days, flow, startAt, isActive }: any) => ({
  name: getName(flow, startAt, frequency, days, isActive),
  startAt: getEndDate(endDate),
  collections: getCollections(group),
});

const columnStyles = [styles.Name, styles.EndDate, styles.Collections, styles.Actions];
const triggerIcon = <TriggerIcon className={styles.Icon} />;

const queries = {
  countQuery: TRIGGER_QUERY_COUNT,
  filterItemsQuery: TRIGGER_LIST_QUERY,
  deleteItemQuery: DELETE_TRIGGER,
};

export const TriggerList = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const setDialog = (id: any) => {
    navigate(`/trigger/${id}/edit`, { state: 'copy' });
  };

  const additionalAction = [
    {
      label: t('Make a copy'),
      icon: <DuplicateIcon />,
      parameter: 'id',
      dialog: setDialog,
    },
  ];

  const columnNames: any = [
    { name: 'name', label: t('Title') },
    { name: 'updated_at', label: t('End date') },
    { label: t('Collections') },
    { label: t('Actions') },
  ];

  const columnAttributes = {
    columnNames,
    columns: getColumns,
    columnStyles,
  };

  const dialogMessage = t("You won't be able to use this trigger.");

  return (
    <List
      title="Triggers"
      listItem="triggers"
      listItemName="trigger"
      pageLink="trigger"
      button={{ show: true, label: t('+ Create Trigger') }}
      listIcon={triggerIcon}
      dialogMessage={dialogMessage}
      {...queries}
      {...columnAttributes}
      searchParameter={['name']}
      additionalAction={additionalAction}
      removeSortBy={['COLLECTION']}
    />
  );
};

export default TriggerList;
