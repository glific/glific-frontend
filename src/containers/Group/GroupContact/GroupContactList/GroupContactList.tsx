import React from 'react';
import { CONTACT_SEARCH_QUERY, GET_CONTACT_COUNT } from '../../../../graphql/queries/Contact';
import styles from './GroupContactList.module.css';
import { ReactComponent as GroupIcon } from '../../../../assets/images/icons/Groups/Dark.svg';
import { List } from '../../../List/List';
import { UPDATE_GROUP_CONTACTS } from '../../../../graphql/mutations/Group';

export interface GroupContactListProps {
  match: any;
  title: string;
}

const columnNames = ['BENEFICIARY', 'ALL GROUPS', 'ACTIONS'];

const getName = (label: string, phone: string) => (
  <>
    <p className={styles.NameText}>{label}</p>
    <p className={styles.Phone}>{phone}</p>
  </>
);

const getGroups = (groups: Array<any>) => (
  <p className={styles.GroupsText}>{groups.map((group: any) => group.label).join(', ')}</p>
);

const getColumns = ({ name, phone, groups }: any) => ({
  label: getName(name, phone),
  groups: getGroups(groups),
});

const dialogTitle = 'Are you sure you want to remove contact from this group?';
const dialogMessage = 'The contact will no longer receive messages sent to this group';
const columnStyles = [styles.Name, styles.Phone, styles.Actions];
const groupIcon = <GroupIcon className={styles.GroupIcon} />;

const queries = {
  countQuery: GET_CONTACT_COUNT,
  filterItemsQuery: CONTACT_SEARCH_QUERY,
  deleteItemQuery: UPDATE_GROUP_CONTACTS,
};

const columnAttributes = {
  columns: getColumns,
  columnStyles,
};

export const GroupContactList: React.SFC<GroupContactListProps> = (props) => {
  const { match, title } = props;
  const groupId = match.params.id;

  const getDeleteQueryVariables = (id: any) => {
    return {
      input: {
        groupId,
        addContactIds: [],
        deleteContactIds: [id],
      },
    };
  };

  return (
    <List
      backLinkButton={{ text: 'Back to all groups', link: '/group' }}
      dialogTitle={dialogTitle}
      columnNames={columnNames}
      title={title}
      listItem="contacts"
      listItemName="contact"
      searchParameter="name"
      filters={{ includeGroups: groupId }}
      button={{ show: false, label: '' }}
      pageLink="contact"
      listIcon={groupIcon}
      deleteModifier={{
        icon: 'cross',
        variables: getDeleteQueryVariables,
        label: 'Remove from this group',
      }}
      editSupport={false}
      dialogMessage={dialogMessage}
      {...queries}
      {...columnAttributes}
    />
  );
};
