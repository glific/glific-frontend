import React from 'react';
import moment from 'moment';
import { useHistory } from 'react-router-dom';

import styles from './TriggerList.module.css';
import { ReactComponent as TriggerIcon } from '../../../assets/images/icons/Trigger/Union.svg';
import { ReactComponent as ClockIcon } from '../../../assets/images/icons/Trigger/Clock.svg';
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
        obj.push(value.label);
      }
    });
  });
  return `Repeat: ${frequency}(${obj.toString()})`;
};

const getName = (name: any, frequency: any, days: any) => (
  <p className={styles.LabelText}>
    {name}
    <br />
    <Tooltip title={getTooltip(frequency, days)} placement="right">
      <span className={styles.TriggerIcon}>
        <ClockIcon />
      </span>
    </Tooltip>
  </p>
);

const getEndDate = (date: any) => (
  <div className={styles.EndDateVal}>{moment(date).format(FULL_DATE_FORMAT)}</div>
);

const getCollections = (group: any) => <p className={styles.Collection}>{group.label}</p>;

const getColumns = ({ name, endDate, group, frequency, days }: any) => ({
  name: getName(name, frequency, days),
  startAt: getEndDate(endDate),
  collections: getCollections(group),
});

const columnNames = ['NAME', 'END DATE', 'COLLECTION', 'ACTIONS'];
const dialogMessage = "You won't be able to use this trigger.";
const columnStyles = [styles.Name, styles.EndDate, styles.Collections, styles.Actions];
const triggerIcon = <TriggerIcon className={styles.Icon} />;

const queries = {
  countQuery: TRIGGER_QUERY_COUNT,
  filterItemsQuery: TRIGGER_LIST_QUERY,
  deleteItemQuery: DELETE_TRIGGER,
};

const columnAttributes = {
  columnNames,
  columns: getColumns,
  columnStyles,
};

export const TriggerList: React.SFC<TriggerListProps> = () => {
  const history = useHistory();

  const setDialog = (id: any) => {
    history.push({ pathname: `/trigger/${id}/edit`, state: 'copy' });
  };

  const additionalAction = [
    {
      label: 'Make a copy',
      icon: <DuplicateIcon />,
      parameter: 'id',
      dialog: setDialog,
    },
  ];

  return (
    <List
      title="Triggers"
      listItem="triggers"
      listItemName="Trigger"
      pageLink="trigger"
      button={{ show: true, label: '+ CREATE TRIGGER' }}
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
