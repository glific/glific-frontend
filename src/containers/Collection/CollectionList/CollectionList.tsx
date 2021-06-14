import React, { useState } from 'react';
import { IconButton } from '@material-ui/core';
import { useLazyQuery, useMutation, useApolloClient } from '@apollo/client';
import { useTranslation } from 'react-i18next';

import styles from './CollectionList.module.css';
import { ReactComponent as CollectionIcon } from '../../../assets/images/icons/Collection/Dark.svg';
import { ReactComponent as FlowDarkIcon } from '../../../assets/images/icons/Flow/Dark.svg';
import ChatDarkIconSVG, {
  ReactComponent as ChatDarkIcon,
} from '../../../assets/images/icons/Chat/UnselectedDark.svg';
import { ReactComponent as AddContactIcon } from '../../../assets/images/icons/Contact/Add.svg';
import {
  DELETE_COLLECTION,
  UPDATE_COLLECTION_CONTACTS,
} from '../../../graphql/mutations/Collection';
import {
  GET_COLLECTIONS_COUNT,
  FILTER_COLLECTIONS,
  GET_COLLECTIONS,
} from '../../../graphql/queries/Collection';
import { GET_FLOWS } from '../../../graphql/queries/Flow';
import { ADD_FLOW_TO_COLLECTION } from '../../../graphql/mutations/Flow';
import { CREATE_AND_SEND_MESSAGE_TO_COLLECTION_MUTATION } from '../../../graphql/mutations/Chat';
import { List } from '../../List/List';
import { DropdownDialog } from '../../../components/UI/DropdownDialog/DropdownDialog';
import { setNotification } from '../../../common/notification';
import { getUserRolePermissions, getUserRole } from '../../../context/role';
import { SearchDialogBox } from '../../../components/UI/SearchDialogBox/SearchDialogBox';
import { CONTACT_SEARCH_QUERY, GET_COLLECTION_CONTACTS } from '../../../graphql/queries/Contact';
import { FLOW_STATUS_PUBLISHED, setVariables } from '../../../common/constants';
import Menu from '../../../components/UI/Menu/Menu';
import { MessageDialog } from '../../../components/UI/MessageDialog/MessageDialog';

export interface CollectionListProps {}

const getLabel = (label: string) => <p className={styles.LabelText}>{label}</p>;

const getDescription = (text: string) => <p className={styles.CollectionDescription}>{text}</p>;

const getColumns = ({ id, label, description }: any) => ({
  id,
  label: getLabel(label),
  description: getDescription(description),
});

const columnStyles = [styles.Label, styles.Description, styles.Actions];
const collectionIcon = <CollectionIcon className={styles.CollectionIcon} />;

const queries = {
  countQuery: GET_COLLECTIONS_COUNT,
  filterItemsQuery: FILTER_COLLECTIONS,
  deleteItemQuery: DELETE_COLLECTION,
};

const columnAttributes = {
  columns: getColumns,
  columnStyles,
};

export const CollectionList: React.SFC<CollectionListProps> = () => {
  const client = useApolloClient();
  const [addFlowDialogShow, setAddFlowDialogShow] = useState(false);
  const [addContactsDialogShow, setAddContactsDialogShow] = useState(false);
  const [sendMessageDialogShow, setSendMessageDialogShow] = useState(false);

  const [contactSearchTerm, setContactSearchTerm] = useState('');
  const [collectionId, setCollectionId] = useState();

  const { t } = useTranslation();

  // get the published flow list
  const [getFlows, { data: flowData }] = useLazyQuery(GET_FLOWS, {
    variables: setVariables({
      status: FLOW_STATUS_PUBLISHED,
    }),
    fetchPolicy: 'network-only', // set for now, need to check cache issue
  });

  const [getContacts, { data: contactsData }] = useLazyQuery(CONTACT_SEARCH_QUERY, {
    variables: setVariables({ name: contactSearchTerm }, 50),
  });

  const [sendMessageToCollections] = useMutation(CREATE_AND_SEND_MESSAGE_TO_COLLECTION_MUTATION, {
    onCompleted: () => {
      setNotification(client, t(`Message successfully send to the collection`));
      setSendMessageDialogShow(false);
    },
  });

  const [getCollectionContacts, { data: collectionContactsData }] =
    useLazyQuery(GET_COLLECTION_CONTACTS);
  const [updateCollectionContacts] = useMutation(UPDATE_COLLECTION_CONTACTS, {
    onCompleted: (data) => {
      const { numberDeleted, groupContacts } = data.updateGroupContacts;
      const numberAdded = groupContacts.length;
      if (numberDeleted > 0 && numberAdded > 0) {
        setNotification(
          client,
          `${numberDeleted} contact${
            numberDeleted === 1 ? '' : 's  were'
          } removed and ${numberAdded} contact${numberAdded === 1 ? '' : 's  were'} added`
        );
      } else if (numberDeleted > 0) {
        setNotification(
          client,
          `${numberDeleted} contact${numberDeleted === 1 ? '' : 's  were'} removed`
        );
      } else {
        setNotification(
          client,
          `${numberAdded} contact${numberAdded === 1 ? '' : 's  were'} added`
        );
      }
      setAddContactsDialogShow(false);
    },
    refetchQueries: [{ query: GET_COLLECTION_CONTACTS, variables: { id: collectionId } }],
  });

  const [addFlowToCollection] = useMutation(ADD_FLOW_TO_COLLECTION, {
    onCompleted: () => {
      setAddFlowDialogShow(false);
      setNotification(client, t('Flow started successfully.'));
    },
  });

  const dialogMessage = t("You won't be able to use this collection again.");

  let flowOptions = [];
  let contactOptions: any = [];
  let collectionContacts: Array<any> = [];
  if (flowData) {
    flowOptions = flowData.flows;
  }
  if (contactsData) {
    contactOptions = contactsData.contacts;
  }
  if (collectionContactsData) {
    collectionContacts = collectionContactsData.group.group.contacts;
  }

  let dialog = null;

  const closeFlowDialogBox = () => {
    setAddFlowDialogShow(false);
  };

  const setFlowDialog = (id: any) => {
    getFlows();
    setCollectionId(id);
    setAddFlowDialogShow(true);
  };

  const setContactsDialog = (id: any) => {
    getCollectionContacts({ variables: { id } });
    getContacts();
    setCollectionId(id);
    setAddContactsDialogShow(true);
  };

  const handleFlowSubmit = (value: any) => {
    addFlowToCollection({
      variables: {
        flowId: value,
        groupId: collectionId,
      },
    });
  };

  const sendMessageToCollection = (message: string) => {
    sendMessageToCollections({
      variables: {
        groupId: collectionId,
        input: {
          body: message,
          senderId: 1,
          type: 'TEXT',
          flow: 'OUTBOUND',
        },
      },
    });
  };

  if (sendMessageDialogShow) {
    dialog = (
      <MessageDialog
        title={t('Send message to collection')}
        onSendMessage={sendMessageToCollection}
        handleClose={() => setSendMessageDialogShow(false)}
      />
    );
  }

  if (addFlowDialogShow) {
    dialog = (
      <DropdownDialog
        title={t('Select a flow')}
        handleOk={handleFlowSubmit}
        handleCancel={closeFlowDialogBox}
        options={flowOptions}
        placeholder={t('Select a flow')}
        description={t('The contact will be responded as per the messages planned in the flow.')}
      />
    );
  }

  const handleCollectionAdd = (value: any) => {
    const selectedContacts = value.filter(
      (contact: any) =>
        !collectionContacts.map((collectionContact: any) => collectionContact.id).includes(contact)
    );
    const unselectedContacts = collectionContacts
      .map((collectionContact: any) => collectionContact.id)
      .filter((contact: any) => !value.includes(contact));

    if (selectedContacts.length === 0 && unselectedContacts.length === 0) {
      setAddContactsDialogShow(false);
    } else {
      updateCollectionContacts({
        variables: {
          input: {
            addContactIds: selectedContacts,
            groupId: collectionId,
            deleteContactIds: unselectedContacts,
          },
        },
      });
    }
  };

  if (addContactsDialogShow) {
    dialog = (
      <SearchDialogBox
        title={t('Add contacts to the collection')}
        handleOk={handleCollectionAdd}
        handleCancel={() => setAddContactsDialogShow(false)}
        options={contactOptions}
        optionLabel="name"
        additionalOptionLabel="phone"
        asyncSearch
        disableClearable
        selectedOptions={collectionContacts}
        renderTags={false}
        searchLabel="Search contacts"
        textFieldPlaceholder="Type here"
        onChange={(value: any) => {
          if (typeof value === 'string') {
            setContactSearchTerm(value);
          }
        }}
      />
    );
  }

  const addContactIcon = <AddContactIcon />;
  const messageMenu = (
    <Menu
      menus={[
        {
          icon: <ChatDarkIcon />,
          title: t('Send a message'),
          onClick: () => setSendMessageDialogShow(true),
        },
        {
          icon: <FlowDarkIcon />,
          title: t('Start a flow'),
          onClick: setFlowDialog,
        },
      ]}
    >
      <IconButton data-testid="staffManagementMenu">
        <img src={ChatDarkIconSVG} className={styles.StaffIcon} alt="staff icon" />
      </IconButton>
    </Menu>
  );

  const additionalAction = [
    {
      label: t('Add contacts to collection'),
      icon: addContactIcon,
      parameter: 'id',
      dialog: setContactsDialog,
    },
    {
      label: '',
      icon: messageMenu,
      parameter: 'id',
      dialog: setCollectionId,
    },
  ];

  const refetchQueries = {
    query: GET_COLLECTIONS,
    variables: setVariables(),
  };

  const getRestrictedAction = () => {
    const action: any = { edit: true, delete: true };
    if (getUserRole().includes('Staff')) {
      action.edit = false;
      action.delete = false;
    }
    return action;
  };

  const cardLink = { start: 'collection', end: 'contacts' };

  // check if the user has access to manage collections
  const userRolePermissions = getUserRolePermissions();

  return (
    <>
      <List
        restrictedAction={getRestrictedAction}
        refetchQueries={refetchQueries}
        title={t('Collections')}
        listItem="groups"
        columnNames={['LABEL']}
        listItemName="collection"
        displayListType="card"
        button={{ show: userRolePermissions.manageCollections, label: t('+ CREATE COLLECTION') }}
        pageLink="collection"
        listIcon={collectionIcon}
        dialogMessage={dialogMessage}
        additionalAction={additionalAction}
        cardLink={cardLink}
        {...queries}
        {...columnAttributes}
      />
      {dialog}
    </>
  );
};

export default CollectionList;
