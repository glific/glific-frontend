import React from 'react';
import styles from './SearchList.module.css';
import { ReactComponent as SearchIcon } from '../../../assets/images/icons/Search/Dark.svg';
import { List } from '../../List/List';
import { SEARCH_QUERY, SEARCH_QUERY_COUNT } from '../../../graphql/queries/Collection';
import { DELETE_SEARCH } from '../../../graphql/mutations/Search';

export interface SearchListProps {}

const getShortcode = (shortcode: string) => <p className={styles.LabelText}>{shortcode}</p>;
const getLabel = (text: string) => <p className={styles.TableText}>{text}</p>;

const getColumns = ({ shortcode, label }: any) => ({
  shortcode: getShortcode(shortcode),
  label: getLabel(label),
});

const columnNames = ['TITLE', 'DESCRIPTION', 'ACTIONS'];
const dialogMessage =
  'This action will remove all the conversations that were linked to this search and remove it as an option to filter your chat screen.';
const columnStyles = [styles.Shortcode, styles.Name, styles.Actions];
const searchIcon = <SearchIcon className={styles.Icon} />;

const queries = {
  countQuery: SEARCH_QUERY_COUNT,
  filterItemsQuery: SEARCH_QUERY,
  deleteItemQuery: DELETE_SEARCH,
};

const columnAttributes = {
  columnNames,
  columns: getColumns,
  columnStyles,
};

export const SearchList: React.SFC<SearchListProps> = () => (
  <List
    title="Searches"
    listItem="savedSearches"
    listItemName="Search"
    pageLink="search"
    button={{ show: true, label: '+ CREATE SEARCH' }}
    listIcon={searchIcon}
    dialogMessage={dialogMessage}
    {...queries}
    {...columnAttributes}
    searchParameter="label"
  />
);
