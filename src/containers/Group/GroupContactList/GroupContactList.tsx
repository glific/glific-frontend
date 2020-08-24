import React from 'react';
import {
  CONTACT_SEARCH_QUERY,
  GET_CONTACT_COUNT,
  DELETE_CONTACT_GROUP,
} from '../../../graphql/queries/Contact';
import styles from './GroupContactList.module.css';
import { ReactComponent as GroupIcon } from '../../../assets/images/icons/StaffManagement/Active.svg';
import { useQuery } from '@apollo/client';
import { List } from '../../List/List';
import { GET_GROUP } from '../../../graphql/queries/Group';

export interface GroupContactListProps {
  match: any;
}

const columnNames = ['NAME', 'ALL GROUPS', 'ACTIONS'];

const getColumns = ({ name, phone, groups }: any) => ({
  label: getName(name, phone),
  groups: getGroups(groups),
});

const getName = (label: string, phone: string) => (
  <>
    <p className={styles.NameText}>{label}</p>
    <p className={styles.Phone}>{phone}</p>
  </>
);

const getGroups = (groups: Array<any>) => (
  <p className={styles.GroupsText}>{groups.map((group: any) => group.label).join(', ')}</p>
);

const dialogMessage = 'This contact will be permanently removed from this group';
const columnStyles = [styles.Name, styles.Phone, styles.Actions];
const groupIcon = <GroupIcon className={styles.GroupIcon} />;

const queries = {
  countQuery: GET_CONTACT_COUNT,
  filterItemsQuery: CONTACT_SEARCH_QUERY,
  deleteItemQuery: DELETE_CONTACT_GROUP,
};

const columnAttributes = {
  columns: getColumns,
  columnStyles: columnStyles,
};

export const GroupContactList: React.SFC<GroupContactListProps> = (props) => {
  const groupId = props.match.params.id;
  const group = useQuery(GET_GROUP, { variables: { id: groupId } });
  const title = group.data ? group.data.group.group.label : 'Group';
  return (
    <List
      columnNames={columnNames}
      title={title}
      listItem="contacts"
      listItemName="contact"
      searchParameter="name"
      filters={{ includeGroups: groupId }}
      button={{ show: false, label: '' }}
      pageLink="contact"
      listIcon={groupIcon}
      deleteIcon={'cross'}
      editSupport={false}
      dialogMessage={dialogMessage}
      {...queries}
      {...columnAttributes}
    />
  );
};
