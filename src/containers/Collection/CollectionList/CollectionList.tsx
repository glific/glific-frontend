import React from 'react';
import styles from './CollectionList.module.css';
import { ReactComponent as CollectionIcon } from '../../../assets/images/icons/Collections/Selected.svg';
import { List } from '../../List/List';
import { SAVED_SEARCH_QUERY, SAVED_SEARCH_QUERY_COUNT } from '../../../graphql/queries/Search';
import { DELETE_COLLECTION } from '../../../graphql/mutations/Collection';

export interface CollectionListProps {}

const getColumns = ({ shortcode, label }: any) => ({
  shortcode: getShortcode(shortcode),
  name: getName(label),
});

const getShortcode = (label: string) => <p className={styles.LabelText}>{label}</p>;
const getName = (text: string) => <p className={styles.TableText}>{text}</p>;

const columnNames = ['TITLE', 'DESCRIPTION', 'ACTIONS'];
const dialogMessage =
  'This action will remove all the conversations that were linked to this collection and remove it as an option to filter your chat screen.';
const columnStyles = [styles.Shortcode, styles.Name, styles.Actions];
const collectionIcon = <CollectionIcon className={styles.CollectionIcon} />;

const queries = {
  countQuery: SAVED_SEARCH_QUERY,
  filterItemsQuery: SAVED_SEARCH_QUERY,
  deleteItemQuery: DELETE_COLLECTION,
};

const columnAttributes = {
  columnNames: columnNames,
  columns: getColumns,
  columnStyles: columnStyles,
};

export const CollectionList: React.SFC<CollectionListProps> = (props) => (
  <List
    title="Collection"
    listItem="savedSearches"
    listItemName="collection"
    pageLink="collection"
    buttonLabel="+ CREATE COLLECTION"
    listIcon={collectionIcon}
    dialogMessage={dialogMessage}
    {...queries}
    {...columnAttributes}
    searchParameter="label"
    // filters={{
    //   label: 'all',
    // }}
  />
);
