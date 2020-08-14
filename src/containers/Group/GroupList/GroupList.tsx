import React from 'react';
import { GET_GROUPS_COUNT, FILTER_GROUPS } from '../../../graphql/queries/Group';
import { DELETE_GROUP } from '../../../graphql/mutations/Group';
import styles from './GroupList.module.css';
import { ReactComponent as GroupIcon } from '../../../assets/images/icons/StaffManagement/Active.svg';
import { ReactComponent as AddContactIcon } from '../../../assets/images/icons/Contact/Add.svg';
import { List } from '../../List/List';

export interface GroupListProps {}

const getColumns = ({ label, description }: any) => ({
  label: getLabel(label),
  description: getDescription(description),
});

const getLabel = (label: string) => <p className={styles.LabelText}>{label}</p>;

const getDescription = (text: string) => <p className={styles.GroupDescription}>{text}</p>;

const dialogMessage = "You won't be able to use this group again.";
const columnStyles = [styles.Label, styles.Description, styles.Actions];
const groupIcon = <GroupIcon className={styles.GroupIcon} />;

const queries = {
  countQuery: GET_GROUPS_COUNT,
  filterItemsQuery: FILTER_GROUPS,
  deleteItemQuery: DELETE_GROUP,
};

const columnAttributes = {
  columns: getColumns,
  columnStyles: columnStyles,
};

const contactIcon = <AddContactIcon />;

const additionalAction = { icon: contactIcon, parameter: 'group', link: '/groups' };

export const GroupList: React.SFC<GroupListProps> = (props) => (
  <List
    title="Groups"
    listItem="groups"
    listItemName="group"
    displayListType="card"
    buttonLabel="+ CREATE GROUP"
    pageLink="group"
    listIcon={groupIcon}
    additionalAction={additionalAction}
    dialogMessage={dialogMessage}
    {...queries}
    {...columnAttributes}
  />
);
