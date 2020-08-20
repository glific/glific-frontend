import React from 'react';

import { CONTACT_SEARCH_QUERY, GET_CONTACT_COUNT } from '../../../graphql/queries/Contact';

import { DELETE_GROUP } from '../../../graphql/mutations/Group';
import styles from './GroupContactList.module.css';
import { ReactComponent as GroupIcon } from '../../../assets/images/icons/StaffManagement/Active.svg';
import { ReactComponent as AddContactIcon } from '../../../assets/images/icons/Contact/Add.svg';
import { List } from '../../List/List';

export interface GroupContactListProps {}

const getColumns = ({ name, phone }: any) => ({
  label: getLabel(name),
  description: getDescription(phone),
});

const getLabel = (label: string) => <p className={styles.LabelText}>{label}</p>;

const getDescription = (text: string) => <p className={styles.GroupDescription}>{text}</p>;

const dialogMessage = "You won't be able to use this group again.";
const columnStyles = [styles.Label, styles.Description, styles.Actions];
const groupIcon = <GroupIcon className={styles.GroupIcon} />;

const queries = {
  countQuery: GET_CONTACT_COUNT,
  filterItemsQuery: CONTACT_SEARCH_QUERY,
  deleteItemQuery: DELETE_GROUP,
};

const columnAttributes = {
  columns: getColumns,
  columnStyles: columnStyles,
};

const contactIcon = <AddContactIcon />;

const additionalAction = { icon: contactIcon, parameter: 'group', link: '/groups' };

export const GroupContactList: React.SFC<GroupContactListProps> = (props) => (
  <List
    title="Contacts"
    listItem="contacts"
    listItemName="contact"
    searchParameter="name"
    buttonLabel="+ CREATE GROUP"
    pageLink="contact"
    listIcon={groupIcon}
    dialogMessage={dialogMessage}
    {...queries}
    {...columnAttributes}
  />
);
