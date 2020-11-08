import React, { useState } from 'react';
import { IconButton } from '@material-ui/core';
import { useLazyQuery, useMutation, useApolloClient } from '@apollo/client';

import styles from './GroupList.module.css';
import { ReactComponent as GroupIcon } from '../../../assets/images/icons/Groups/Dark.svg';
import { ReactComponent as AutomationDarkIcon } from '../../../assets/images/icons/Automations/Dark.svg';
import { ReactComponent as ChatDarkIcon } from '../../../assets/images/icons/Chat/UnselectedDark.svg';
import ChatDarkIconSVG from '../../../assets/images/icons/Chat/UnselectedDark.svg';
import { ReactComponent as AddContactIcon } from '../../../assets/images/icons/Contact/Add.svg';
import { DELETE_GROUP, UPDATE_GROUP_CONTACTS } from '../../../graphql/mutations/Group';
import { GET_GROUPS_COUNT, FILTER_GROUPS, GET_GROUPS } from '../../../graphql/queries/Group';
import { GET_AUTOMATIONS } from '../../../graphql/queries/Automation';
import { ADD_AUTOMATION_TO_GROUP } from '../../../graphql/mutations/Automation';
import { CONTACT_SEARCH_QUERY, GET_GROUP_CONTACTS } from '../../../graphql/queries/Contact';
import { CREATE_AND_SEND_MESSAGE_TO_GROUP_MUTATION } from '../../../graphql/mutations/Chat';
import { List } from '../../List/List';
import { DropdownDialog } from '../../../components/UI/DropdownDialog/DropdownDialog';
import { setNotification } from '../../../common/notification';
import { displayUserGroups } from '../../../context/role';
import { SearchDialogBox } from '../../../components/UI/SearchDialogBox/SearchDialogBox';
import { setVariables } from '../../../common/constants';
import Menu from '../../../components/UI/Menu/Menu';
import { MessageDialog } from '../../../components/UI/MessageDialog/MessageDialog';

export interface GroupListProps {}

const getColumns = ({ id, label, description }: any) => ({
  id: id,
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

export const GroupList: React.SFC<GroupListProps> = (props) => {
  const client = useApolloClient();
  const [addAutomationDialogShow, setAddAutomationDialogShow] = useState(false);
  const [addContactsDialogShow, setAddContactsDialogShow] = useState(false);
  const [sendMessageDialogShow, setSendMessageDialogShow] = useState(false);

  const [contactSearchTerm, setContactSearchTerm] = useState('');
  const [groupId, setGroupId] = useState();

  const [getAutomations, { data: automationData }] = useLazyQuery(GET_AUTOMATIONS);
  const [getContacts, { data: contactsData }] = useLazyQuery(CONTACT_SEARCH_QUERY, {
    variables: setVariables({ name: contactSearchTerm }, 50),
  });

  const [sendMessageToGroups] = useMutation(CREATE_AND_SEND_MESSAGE_TO_GROUP_MUTATION, {
    onCompleted: () => {
      setNotification(client, `Message successfully send to the group`);
      setSendMessageDialogShow(false);
    },
  });

  const [getGroupContacts, { data: groupContactsData }] = useLazyQuery(GET_GROUP_CONTACTS);
  const [updateGroupContacts] = useMutation(UPDATE_GROUP_CONTACTS, {
    onCompleted: (data) => {
      const numberDeleted = data.updateGroupContacts.numberDeleted;
      const numberAdded = data.updateGroupContacts.groupContacts.length;
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
    refetchQueries: [{ query: GET_GROUP_CONTACTS, variables: { id: groupId } }],
  });

  const [addAutomationToGroup] = useMutation(ADD_AUTOMATION_TO_GROUP, {
    onCompleted: (data: any) => {
      setAddAutomationDialogShow(false);
      setNotification(client, 'Automation started successfully');
    },
  });
  let automationOptions = [];
  let contactOptions = [];
  let groupContacts: Array<any> = [];
  if (automationData) {
    automationOptions = automationData.flows;
  }
  if (contactsData) {
    contactOptions = contactsData.contacts;
  }
  if (groupContactsData) {
    groupContacts = groupContactsData.group.group.contacts;
  }

  let dialog = null;

  const closeAutomationDialogBox = () => {
    setAddAutomationDialogShow(false);
  };

  const setAutomationDialog = (id: any) => {
    getAutomations();
    setGroupId(id);
    setAddAutomationDialogShow(true);
  };

  const setContactsDialog = (id: any) => {
    getGroupContacts({ variables: { id } });
    getContacts();
    setGroupId(id);
    setAddContactsDialogShow(true);
  };

  const handleAutomationSubmit = (value: any) => {
    addAutomationToGroup({
      variables: {
        flowId: value,
        groupId: groupId,
      },
    });
  };

  const sendMessageToGroup = (message: string) => {
    sendMessageToGroups({
      variables: {
        groupId: groupId,
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
        title="Send message to group"
        onSendMessage={sendMessageToGroup}
        handleClose={() => setSendMessageDialogShow(false)}
      ></MessageDialog>
    );
  }

  if (addAutomationDialogShow) {
    dialog = (
      <DropdownDialog
        title="Select automation flow"
        handleOk={handleAutomationSubmit}
        handleCancel={closeAutomationDialogBox}
        options={automationOptions}
        placeholder="Select flow"
        description="The contact will be responded as per the messages planned in the automation."
      />
    );
  }

  const handleGroupAdd = (value: any) => {
    const selectedContacts = value.filter(
      (contact: any) => !groupContacts.map((groupContact: any) => groupContact.id).includes(contact)
    );
    const unselectedContacts = groupContacts
      .map((groupContact: any) => groupContact.id)
      .filter((contact: any) => !value.includes(contact));

    if (selectedContacts.length === 0 && unselectedContacts.length === 0) {
      setAddContactsDialogShow(false);
    } else {
      updateGroupContacts({
        variables: {
          input: {
            addContactIds: selectedContacts,
            groupId: groupId,
            deleteContactIds: unselectedContacts,
          },
        },
      });
    }
  };

  if (addContactsDialogShow) {
    dialog = (
      <SearchDialogBox
        title="Add contacts to the group"
        handleOk={handleGroupAdd}
        handleCancel={() => setAddContactsDialogShow(false)}
        options={contactOptions}
        optionLabel="name"
        asyncSearch={true}
        selectedOptions={groupContacts}
        onChange={(value: any) => {
          setContactSearchTerm(value);
        }}
      />
    );
  }

  const addContactIcon = <AddContactIcon />;
  const messageMenu = (
    <Menu
      menus={[
        {
          icon: <ChatDarkIcon className={styles.Icon} />,
          title: 'Send a message',
          onClick: () => setSendMessageDialogShow(true),
        },
        {
          icon: <AutomationDarkIcon className={styles.Icon} />,
          title: 'Start automation flow',
          onClick: setAutomationDialog,
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
      label: 'Add contacts to group',
      icon: addContactIcon,
      parameter: 'id',
      dialog: setContactsDialog,
    },
    {
      label: '',
      icon: messageMenu,
      parameter: 'id',
      dialog: setGroupId,
    },
  ];

  const refetchQueries = {
    query: GET_GROUPS,
    variables: setVariables(),
  };
  const cardLink = { start: 'group', end: 'contacts' };
  return (
    <>
      <List
        refetchQueries={refetchQueries}
        title="Groups"
        listItem="groups"
        listItemName="group"
        displayListType="card"
        button={{ show: displayUserGroups, label: '+ CREATE GROUP' }}
        pageLink="group"
        listIcon={groupIcon}
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
