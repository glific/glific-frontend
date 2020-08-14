import React from 'react';
import { GET_GROUPS_COUNT, FILTER_GROUPS } from '../../../graphql/queries/Group';
import { DELETE_GROUP } from '../../../graphql/mutations/Group';
import styles from './GroupList.module.css';
import { ReactComponent as TagIcon } from '../../../assets/images/icons/Tags/Selected.svg';
import { ReactComponent as FilledTagIcon } from '../../../assets/images/icons/Tags/Filled.svg';
import { List } from '../../List/List';

export interface GroupListProps {}

const getColumns = ({ label, description }: any) => ({
  label: getLabel(label),
  description: getDescription(description),
});

const getLabel = (label: string) => <p className={styles.LabelText}>{label}</p>;

const getDescription = (text: string) => <p className={styles.GroupDescription}>{text}</p>;

const dialogMessage = "You won't be able to use this for tagging messages.";
const columnStyles = [styles.Label, styles.Description, styles.Actions];
const tagIcon = <TagIcon className={styles.TagIcon} />;

const queries = {
  countQuery: GET_GROUPS_COUNT,
  filterItemsQuery: FILTER_GROUPS,
  deleteItemQuery: DELETE_GROUP,
};

const columnAttributes = {
  columns: getColumns,
  columnStyles: columnStyles,
};

export const GroupList: React.SFC<GroupListProps> = (props) => (
  <List
    title="Groups"
    listItem="groups"
    listItemName="group"
    displayListType="card"
    buttonLabel="+ CREATE GROUP"
    pageLink="group"
    listIcon={tagIcon}
    dialogMessage={dialogMessage}
    {...queries}
    {...columnAttributes}
  />
);
