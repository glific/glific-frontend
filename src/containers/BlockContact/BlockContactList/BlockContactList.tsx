import React, { useState } from 'react';
import { useMutation, useApolloClient } from '@apollo/client';
import { useTranslation } from 'react-i18next';

import { ReactComponent as BlockIcon } from 'assets/images/icons/Block.svg';
import { ReactComponent as UnblockIcon } from 'assets/images/icons/Unblock.svg';
import { List } from 'containers/List/List';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { setNotification } from 'common/notification';
import { SEARCH_QUERY_VARIABLES } from 'common/constants';
import { CONTACT_SEARCH_QUERY, GET_CONTACT_COUNT } from 'graphql/queries/Contact';
import { DELETE_CONTACT, UPDATE_CONTACT } from 'graphql/mutations/Contact';
import { SEARCH_QUERY } from 'graphql/queries/Search';
import styles from './BlockContactList.module.css';

export interface BlockContactListProps {}

const getName = (name: string) => <p className={styles.LabelText}>{name}</p>;

const getPhone = (text: string) => <p className={styles.TableText}>{text}</p>;

const getColumns = ({ name, maskedPhone }: any) => ({
  name: getName(name),
  phone: getPhone(maskedPhone),
});

const columnNames = ['NAME', 'PHONE NO', 'ACTIONS'];

const columnStyles = [styles.Label, styles.Phone, styles.Actions];
const blockIcon = <BlockIcon className={styles.BlockIcon} />;

const queries = {
  countQuery: GET_CONTACT_COUNT,
  filterItemsQuery: CONTACT_SEARCH_QUERY,
  deleteItemQuery: DELETE_CONTACT,
};

const columnAttributes = {
  columnNames,
  columns: getColumns,
  columnStyles,
};

export const BlockContactList: React.SFC<BlockContactListProps> = () => {
  const client = useApolloClient();
  const [contactId, setContactId] = useState();
  const [unblockDialog, setUnblockDialog] = useState(false);
  const { t } = useTranslation();

  const unblockIcon = <UnblockIcon />;

  // currently updating using refetch until we find a better way
  const contactSearchQueryVariables = {
    filter: { name: '', status: 'BLOCKED' },
    opts: {
      limit: 50,
      offset: 0,
      order: 'ASC',
    },
  };

  const [unblockContact] = useMutation(UPDATE_CONTACT, {
    onCompleted: () => {
      setUnblockDialog(false);
      setNotification(client, t('Contact unblocked successfully'));
    },
    refetchQueries: [
      { query: SEARCH_QUERY, variables: SEARCH_QUERY_VARIABLES },
      { query: CONTACT_SEARCH_QUERY, variables: contactSearchQueryVariables },
      { query: GET_CONTACT_COUNT, variables: contactSearchQueryVariables },
    ],
  });

  let dialog = null;

  const setDialog = (id: any) => {
    setContactId(id);
    setUnblockDialog(true);
  };

  const handleUnblock = () => {
    const variables = {
      id: contactId,
      input: {
        status: 'VALID',
      },
    };

    unblockContact({
      variables,
    });
  };

  if (unblockDialog) {
    dialog = (
      <DialogBox
        title={t('Do you want to unblock this contact')}
        handleOk={handleUnblock}
        handleCancel={() => setUnblockDialog(false)}
        alignButtons="center"
      >
        <p className={styles.DialogText}>
          {t('You will be able to view their chats and interact with them again.')}
        </p>
      </DialogBox>
    );
  }

  const additionalAction = [
    {
      icon: unblockIcon,
      parameter: 'id',
      dialog: setDialog,
      label: t('Unblock'),
    },
  ];

  const dialogMessage = t('This contact will be permanently deleted');

  return (
    <>
      <List
        title={t('Blocked contacts')}
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
        noItemText="blocked contact"
        editSupport={false}
        {...columnAttributes}
      />
      {dialog}
    </>
  );
};

export default BlockContactList;
