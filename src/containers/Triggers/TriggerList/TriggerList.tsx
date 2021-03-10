import React from 'react';
import moment from 'moment';
import { useHistory } from 'react-router-dom';

import styles from './TriggerList.module.css';
import { ReactComponent as TriggerIcon } from '../../../assets/images/icons/Trigger/Union.svg';
import { ReactComponent as DuplicateIcon } from '../../../assets/images/icons/Flow/Duplicate.svg';
import { List } from '../../List/List';
import { TRIGGER_LIST_QUERY, TRIGGER_QUERY_COUNT } from '../../../graphql/queries/Trigger';
import { DELETE_SEARCH } from '../../../graphql/mutations/Search';
import { FULL_DATE_FORMAT } from '../../../common/constants';

export interface TriggerListProps {}

const getName = (name: any) => <p className={styles.LabelText}>{name}</p>;

const getStartAt = (date: any) => (
  <div className={styles.StartDate}>{moment(date).format(FULL_DATE_FORMAT)}</div>
);

const getCollections = (group: any) => <p className={styles.Collection}>{group.label}</p>;

const getColumns = ({ name, startAt, group }: any) => ({
  name: getName(name),
  startAt: getStartAt(startAt),
  collections: getCollections(group),
});

const columnNames = ['NAME', 'END DATE', 'COLLECTION'];
const dialogMessage = "You won't be able to use this trigger.";
const columnStyles = [styles.Name, styles.EndDate, styles.Collections];
const triggerIcon = <TriggerIcon className={styles.Icon} />;

const queries = {
  countQuery: TRIGGER_QUERY_COUNT,
  filterItemsQuery: TRIGGER_LIST_QUERY,
  deleteItemQuery: DELETE_SEARCH,
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
      {...queries}
      {...columnAttributes}
      searchParameter="name"
      additionalAction={additionalAction}
    />
  );
};
