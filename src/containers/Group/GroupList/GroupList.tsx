import React, { useState } from 'react';
import { IconButton } from '@material-ui/core';
import { useLazyQuery, useMutation, useApolloClient } from '@apollo/client';

import styles from './GroupList.module.css';
import { ReactComponent as GroupIcon } from '../../../assets/images/icons/Groups/Dark.svg';
import { ReactComponent as FlowDarkIcon } from '../../../assets/images/icons/Flow/Dark.svg';
import ChatDarkIconSVG, {
  ReactComponent as ChatDarkIcon,
} from '../../../assets/images/icons/Chat/UnselectedDark.svg';
import { ReactComponent as AddContactIcon } from '../../../assets/images/icons/Contact/Add.svg';
import { DELETE_GROUP, UPDATE_GROUP_CONTACTS } from '../../../graphql/mutations/Group';
import { GET_GROUPS_COUNT, FILTER_GROUPS, GET_GROUPS } from '../../../graphql/queries/Group';
import { GET_FLOWS } from '../../../graphql/queries/Flow';
import { ADD_FLOW_TO_GROUP } from '../../../graphql/mutations/Flow';
import { CREATE_AND_SEND_MESSAGE_TO_GROUP_MUTATION } from '../../../graphql/mutations/Chat';
import { List } from '../../List/List';
import { DropdownDialog } from '../../../components/UI/DropdownDialog/DropdownDialog';
import { setNotification } from '../../../common/notification';
import { displayUserGroups } from '../../../context/role';
import { SearchDialogBox } from '../../../components/UI/SearchDialogBox/SearchDialogBox';
import { CONTACT_SEARCH_QUERY, GET_GROUP_CONTACTS } from '../../../graphql/queries/Contact';
import { FLOW_STATUS_PUBLISHED, setVariables } from '../../../common/constants';
import Menu from '../../../components/UI/Menu/Menu';
import { MessageDialog } from '../../../components/UI/MessageDialog/MessageDialog';

export interface GroupListProps {}

const getLabel = (label: string) => <p className={styles.LabelText}>{label}</p>;

const getDescription = (text: string) => <p className={styles.GroupDescription}>{text}</p>;

const getColumns = ({ id, label, description }: any) => ({
  id,
  label: getLabel(label),
  description: getDescription(description),
});

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
  columnStyles,
};

export const GroupList: React.SFC<GroupListProps> = () => {
  const client = useApolloClient();
  const [addFlowDialogShow, setAddFlowDialogShow] = useState(false);
  const [addContactsDialogShow, setAddContactsDialogShow] = useState(false);
  const [sendMessageDialogShow, setSendMessageDialogShow] = useState(false);

  const [contactSearchTerm, setContactSearchTerm] = useState('');
  const [groupId, setGroupId] = useState();

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

  const [sendMessageToGroups] = useMutation(CREATE_AND_SEND_MESSAGE_TO_GROUP_MUTATION, {
    onCompleted: () => {
      setNotification(client, `Message successfully send to the group`);
      setSendMessageDialogShow(false);
    },
  });

  const [getGroupContacts, { data: groupContactsData }] = useLazyQuery(GET_GROUP_CONTACTS);
  const [updateGroupContacts] = useMutation(UPDATE_GROUP_CONTACTS, {
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
    refetchQueries: [{ query: GET_GROUP_CONTACTS, variables: { id: groupId } }],
  });

  const [addFlowToGroup] = useMutation(ADD_FLOW_TO_GROUP, {
    onCompleted: () => {
      setAddFlowDialogShow(false);
      setNotification(client, 'Flow started successfully');
    },
  });
  let flowOptions = [];
  let contactOptions = [];
  let groupContacts: Array<any> = [];
  if (flowData) {
    flowOptions = flowData.flows;
  }
  if (contactsData) {
    contactOptions = contactsData.contacts;
  }
  if (groupContactsData) {
    groupContacts = groupContactsData.group.group.contacts;
  }

  let dialog = null;

  const closeFlowDialogBox = () => {
    setAddFlowDialogShow(false);
  };

  const setFlowDialog = (id: any) => {
    getFlows();
    setGroupId(id);
    setAddFlowDialogShow(true);
  };

  const setContactsDialog = (id: any) => {
    getGroupContacts({ variables: { id } });
    getContacts();
    setGroupId(id);
    setAddContactsDialogShow(true);
  };

  const handleFlowSubmit = (value: any) => {
    addFlowToGroup({
      variables: {
        flowId: value,
        groupId,
      },
    });
  };

  const sendMessageToGroup = (message: string) => {
    sendMessageToGroups({
      variables: {
        groupId,
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
      />
    );
  }

  if (addFlowDialogShow) {
    dialog = (
      <DropdownDialog
        title="Select a flow"
        handleOk={handleFlowSubmit}
        handleCancel={closeFlowDialogBox}
        options={flowOptions}
        placeholder="Select a flow"
        description="The contact will be responded as per the messages planned in the flow."
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
            groupId,
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
        asyncSearch
        selectedOptions={groupContacts}
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
          title: 'Send a message',
          onClick: () => setSendMessageDialogShow(true),
        },
        {
          icon: <FlowDarkIcon />,
          title: 'Start a flow',
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
        columnNames={['LABEL']}
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
