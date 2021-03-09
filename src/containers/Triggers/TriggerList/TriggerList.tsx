import React from 'react';
import moment from 'moment';

import styles from './TriggerList.module.css';
import { ReactComponent as SearchIcon } from '../../../assets/images/icons/Search/Dark.svg';
import { List } from '../../List/List';
import { TRIGGER_LIST_QUERY, TRIGGER_QUERY_COUNT } from '../../../graphql/queries/Trigger';
import { DELETE_SEARCH } from '../../../graphql/mutations/Search';
import { DATE_TIME_FORMAT } from '../../../common/constants';

export interface TriggerListProps {}

const getName = (flow: any) => <p className={styles.LabelText}>{flow.name}</p>;

const getStartAt = (date: any) => (
  <div className={styles.StartDate}>{moment(date.startAt).format(DATE_TIME_FORMAT)}</div>
);

const getCollections = (group: any) => <p className={styles.Collection}>{group.label}</p>;

const getColumns = ({ flow, startAt, group }: any) => ({
  name: getName(flow),
  startAt: getStartAt(startAt),
  collections: getCollections(group),
});

const columnNames = ['NAME', 'END DATE', 'COLLECTION'];
const dialogMessage =
  'This action will remove all the conversations that were linked to this search and remove it as an option to filter your chat screen.';
const columnStyles = [styles.Name, styles.EndDate, styles.Collections];
const searchIcon = <SearchIcon className={styles.Icon} />;

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

export const TriggerList: React.SFC<TriggerListProps> = () => (
  <List
    title="Triggers"
    listItem="triggers"
    listItemName="Search"
    pageLink="trigger"
    button={{ show: true, label: '+ CREATE TRIGGER' }}
    listIcon={searchIcon}
    dialogMessage={dialogMessage}
    {...queries}
    {...columnAttributes}
    searchParameter="label"
  />
);
