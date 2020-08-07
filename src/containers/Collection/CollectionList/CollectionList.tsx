import React from 'react';
import styles from './CollectionList.module.css';
import { ReactComponent as CollectionIcon } from '../../../assets/images/icons/Collections/Selected.svg';
import { ReactComponent as ConfigureIcon } from '../../../assets/images/icons/Configure/UnselectedDark.svg';
import { List } from '../../List/List';
import { FILTER_AUTOMATION, GET_AUTOMATION_COUNT } from '../../../graphql/queries/Automation';
import { DELETE_AUTOMATION } from '../../../graphql/mutations/Automation';

export interface CollectionListProps {}

const getColumns = ({ shortcode, name }: any) => ({
  shortcode: getShortcode(shortcode),
  name: getName(name),
});

const getShortcode = (label: string) => <p className={styles.LabelText}>{label}</p>;
const getName = (text: string) => <p className={styles.TableText}>{text}</p>;

const columnNames = ['TITLE', 'DESCRIPTION', 'ACTIONS'];
const dialogMessage =
  'This action will remove all the conversations that were linked to this collection and remove it as an option to filter your chat screen.';
const columnStyles = [styles.Shortcode, styles.Name, styles.Actions];
const collectionIcon = <CollectionIcon className={styles.CollectionIcon} />;

const queries = {
  countQuery: GET_AUTOMATION_COUNT,
  filterItemsQuery: FILTER_AUTOMATION,
  deleteItemQuery: DELETE_AUTOMATION,
};

const columnAttributes = {
  columnNames: columnNames,
  columns: getColumns,
  columnStyles: columnStyles,
};
const configureIcon = <ConfigureIcon></ConfigureIcon>;

// const additionalAction = { icon: configureIcon, parameter: 'uuid', link: '/collection/configure' };

export const CollectionList: React.SFC<CollectionListProps> = (props) => (
  <List
    title="Collection"
    listItem="flows"
    listItemName="collection"
    pageLink="collection"
    buttonLabel="+ CREATE COLLECTION"
    listIcon={collectionIcon}
    dialogMessage={dialogMessage}
    {...queries}
    {...columnAttributes}
    searchParameter="name"
    // additionalAction={additionalAction}
  />
);
