import React from 'react';
import { useTranslation } from 'react-i18next';

import { ReactComponent as SearchIcon } from 'assets/images/icons/Search/Dark.svg';
import { List } from 'containers/List/List';
import { SEARCH_LIST_QUERY, SEARCH_QUERY_COUNT } from 'graphql/queries/Search';
import { DELETE_SEARCH } from 'graphql/mutations/Search';
import styles from './SearchList.module.css';

const getShortcode = (shortcode: string) => <p className={styles.LabelText}>{shortcode}</p>;
const getLabel = (text: string) => <p className={styles.TableText}>{text}</p>;

const getColumns = ({ shortcode, label }: any) => ({
  shortcode: getShortcode(shortcode),
  label: getLabel(label),
});

const columnStyles = [styles.Shortcode, styles.Name, styles.Actions];
const searchIcon = <SearchIcon className={styles.Icon} />;

const queries = {
  countQuery: SEARCH_QUERY_COUNT,
  filterItemsQuery: SEARCH_LIST_QUERY,
  deleteItemQuery: DELETE_SEARCH,
};

export const SearchList = () => {
  const { t } = useTranslation();

  const columnNames = [
    { name: 'shortcode', label: t('Title') },
    { name: 'label', label: t('Description') },
    { label: t('Actions') },
  ];
  const dialogMessage = t(
    'This action will remove all the conversations that were linked to this search and remove it as an option to filter your chat screen.'
  );

  const columnAttributes = {
    columnNames,
    columns: getColumns,
    columnStyles,
  };

  return (
    <List
      title="Searches"
      listItem="savedSearches"
      listItemName="Search"
      pageLink="search"
      button={{ show: true, label: t('+ Create Search') }}
      listIcon={searchIcon}
      dialogMessage={dialogMessage}
      {...queries}
      {...columnAttributes}
      searchParameter={['label']}
    />
  );
};

export default SearchList;
