import React, { useState } from 'react';
import styles from './BlockContactList.module.css';
import { ReactComponent as BlockIcon } from '../../../assets/images/icons/Block.svg';
import { ReactComponent as UnblockIcon } from '../../../assets/images/icons/Unblock.svg';
import { List } from '../../List/List';
import { CONTACT_SEARCH_QUERY, GET_CONTACT_COUNT } from '../../../graphql/queries/Contact';
import { DialogBox } from '../../../components/UI/DialogBox/DialogBox';
import { DELETE_CONTACT, UPDATE_CONTACT } from '../../../graphql/mutations/Contact';
import { useMutation, useApolloClient } from '@apollo/client';
import { setNotification } from '../../../common/notification';
import { SEARCH_QUERY } from '../../../graphql/queries/Search';
import { SEARCH_QUERY_VARIABLES } from '../../../common/constants';

export interface BlockContactListProps {}

const getColumns = ({ name, phone }: any) => ({
  name: getName(name),
  phone: getPhone(phone),
});

const getName = (name: string) => <p className={styles.LabelText}>{name}</p>;

const getPhone = (text: string) => <p className={styles.TableText}>{text}</p>;

const columnNames = ['NAME', 'PHONE NO', 'ACTIONS'];
const dialogMessage = 'This contact will be permanently deleted';
const columnStyles = [styles.Label, styles.Phone, styles.Actions];
const blockIcon = <BlockIcon className={styles.BlockIcon} />;

const queries = {
  countQuery: GET_CONTACT_COUNT,
  filterItemsQuery: CONTACT_SEARCH_QUERY,
  deleteItemQuery: DELETE_CONTACT,
};

const columnAttributes = {
  columnNames: columnNames,
  columns: getColumns,
  columnStyles: columnStyles,
};

export const BlockContactList: React.SFC<BlockContactListProps> = (props) => {
  const client = useApolloClient();
  const [contactId, setContactId] = useState();
  const unblockIcon = <UnblockIcon />;

  //currently updating using refetch until we find a better way
  const contactSearchQueryVariables = {
    filter: { name: '', status: 'BLOCKED' },
    opts: {
      limit: 10,
      offset: 0,
      order: 'ASC',
    },
  };
  const [unblockContact] = useMutation(UPDATE_CONTACT, {
    onCompleted: () => {
      setUnblockDialog(false);
      setNotification(client, 'Contact unblocked successfully');
    },
    refetchQueries: [
      { query: SEARCH_QUERY, variables: SEARCH_QUERY_VARIABLES },
      { query: CONTACT_SEARCH_QUERY, variables: contactSearchQueryVariables },
      { query: GET_CONTACT_COUNT, variables: contactSearchQueryVariables },
    ],
  });

  const [unblockDialog, setUnblockDialog] = useState(false);
  let dialog = null;

  const setDialog = (id: any) => {
    setContactId(id);
    setUnblockDialog(true);
  };

  const handleUnblock = () => {
    unblockContact({
      variables: {
        id: contactId,
        input: {
          status: 'VALID',
        },
      },
    });
  };

  if (unblockDialog) {
    dialog = (
      <DialogBox
        title="Do you want to unblock this contact"
        handleOk={handleUnblock}
        handleCancel={() => setUnblockDialog(false)}
        alignButtons={'center'}
      >
        <p className={styles.DialogText}>
          You will be able to view their chats and interact with them again
        </p>
      </DialogBox>
    );
  }

  const additionalAction = [
    {
      icon: unblockIcon,
      parameter: 'id',
      dialog: setDialog,
      label: 'Unblock',
    },
  ];
  return (
    <>
      <List
        title="Blocked contacts"
        listItem="contacts"
        listItemName="contact"
        pageLink="contacts"
        listIcon={blockIcon}
        additionalAction={additionalAction}
        searchParameter="name"
        filters={{ status: 'BLOCKED' }}
        button={{ show: false, label: '' }}
        dialogMessage={dialogMessage}
        {...queries}
        editSupport={false}
        {...columnAttributes}
      />
      {dialog}
    </>
  );
};
