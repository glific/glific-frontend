import React from 'react';
import moment from 'moment';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import styles from './TriggerList.module.css';
import { ReactComponent as TriggerIcon } from '../../../assets/images/icons/Trigger/Union.svg';
import { ReactComponent as ClockIcon } from '../../../assets/images/icons/Trigger/Clock.svg';
import { ReactComponent as ClockInactiveIcon } from '../../../assets/images/icons/Trigger/Inactive.svg';
import { ReactComponent as DuplicateIcon } from '../../../assets/images/icons/Flow/Duplicate.svg';
import { List } from '../../List/List';
import { TRIGGER_LIST_QUERY, TRIGGER_QUERY_COUNT } from '../../../graphql/queries/Trigger';
import { DELETE_TRIGGER } from '../../../graphql/mutations/Trigger';
import { setVariables, FULL_DATE_FORMAT, dayList } from '../../../common/constants';
import { Tooltip } from '../../../components/UI/Tooltip/Tooltip';

export interface TriggerListProps {}

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

const getName = (flow: any, startAt: any, frequency: any, days: any, isActive: any) => (
  <p className={styles.LabelText}>
    <Tooltip title={getTooltip(frequency, days)} tooltipClass={styles.Tooltip} placement="right">
      <span className={styles.TriggerIcon}>{isActive ? <ClockIcon /> : <ClockInactiveIcon />}</span>
    </Tooltip>
    {`${flow.name}_${moment(startAt).format('DD/MM/yyyy_hh:mmA')}`}
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

export const TriggerList: React.SFC<TriggerListProps> = () => {
  const history = useHistory();
  const { t } = useTranslation();

  const setDialog = (id: any) => {
    history.push({ pathname: `/trigger/${id}/edit`, state: 'copy' });
  };

  const additionalAction = [
    {
      label: t('Make a copy'),
      icon: <DuplicateIcon />,
      parameter: 'id',
      dialog: setDialog,
    },
  ];
  const columnNames = ['NAME', 'END DATE', 'COLLECTION', 'ACTIONS'];
  const columnAttributes = {
    columnNames,
    columns: getColumns,
    columnStyles,
  };

  const dialogMessage = t("You won't be able to use this trigger.");

  return (
    <List
      title="Triggers (Beta)"
      listItem="triggers"
      listItemName="trigger"
      pageLink="trigger"
      button={{ show: true, label: t('+ CREATE TRIGGER') }}
      listIcon={triggerIcon}
      dialogMessage={dialogMessage}
      refetchQueries={{ query: TRIGGER_LIST_QUERY, variables: setVariables() }}
      {...queries}
      {...columnAttributes}
      searchParameter="name"
      additionalAction={additionalAction}
      removeSortBy={['COLLECTION']}
    />
  );
};

export default TriggerList;
