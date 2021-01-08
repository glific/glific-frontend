import React, { useEffect, useState } from 'react';
import {
  Toolbar,
  Typography,
  Popper,
  Fade,
  Paper,
  Button,
  ClickAwayListener,
  IconButton,
} from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import { useMutation, useLazyQuery, useApolloClient } from '@apollo/client';

import styles from './ContactBar.module.css';
import { SearchDialogBox } from '../../../../components/UI/SearchDialogBox/SearchDialogBox';
import { ReactComponent as DropdownIcon } from '../../../../assets/images/icons/BrownDropdown.svg';
import { ReactComponent as AddContactIcon } from '../../../../assets/images/icons/Contact/Light.svg';
import { ReactComponent as BlockIcon } from '../../../../assets/images/icons/Block.svg';
import { ReactComponent as BlockDisabledIcon } from '../../../../assets/images/icons/BlockDisabled.svg';
import { ReactComponent as ProfileIcon } from '../../../../assets/images/icons/Contact/Profile.svg';
import { ReactComponent as ProfileDisabledIcon } from '../../../../assets/images/icons/Contact/ProfileDisabled.svg';
import { ReactComponent as FlowIcon } from '../../../../assets/images/icons/Flow/Dark.svg';
import { ReactComponent as FlowUnselectedIcon } from '../../../../assets/images/icons/Flow/Unselected.svg';
import { ReactComponent as ClearConversation } from '../../../../assets/images/icons/Chat/ClearConversation.svg';
import { ReactComponent as ChatIcon } from '../../../../assets/images/icons/Chat/UnselectedDark.svg';
import { GET_GROUPS } from '../../../../graphql/queries/Group';
import { UPDATE_CONTACT_GROUPS } from '../../../../graphql/mutations/Group';
import { GET_CONTACT_GROUPS } from '../../../../graphql/queries/Contact';
import { GET_FLOWS } from '../../../../graphql/queries/Flow';
import { ADD_FLOW_TO_CONTACT } from '../../../../graphql/mutations/Flow';
import { UPDATE_CONTACT } from '../../../../graphql/mutations/Contact';
import { SEARCH_QUERY } from '../../../../graphql/queries/Search';
import { setNotification } from '../../../../common/notification';
import {
  FLOW_STATUS_PUBLISHED,
  is24HourWindowOver,
  SEARCH_QUERY_VARIABLES,
  setVariables,
} from '../../../../common/constants';
import { Timer } from '../../../../components/UI/Timer/Timer';
import { DropdownDialog } from '../../../../components/UI/DropdownDialog/DropdownDialog';
import { DialogBox } from '../../../../components/UI/DialogBox/DialogBox';
import { Tooltip } from '../../../../components/UI/Tooltip/Tooltip';
import { CLEAR_MESSAGES } from '../../../../graphql/mutations/Chat';

export interface ContactBarProps {
  contactName: string;
  contactId: string;
  lastMessageTime: any;
  contactStatus: string;
  contactBspStatus: string;
  handleAction?: any;
  isSimulator?: boolean;
}

export const ContactBar: React.SFC<ContactBarProps> = (props) => {
  const {
    contactId,
    contactBspStatus,
    lastMessageTime,
    contactStatus,
    contactName,
    isSimulator,
  } = props;
  const client = useApolloClient();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const history = useHistory();
  const [showGroupDialog, setShowGroupDialog] = useState(false);
  const [showFlowDialog, setShowFlowDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showClearChatDialog, setClearChatDialog] = useState(false);

  // get group list
  const [getGroups, { data: groupsData }] = useLazyQuery(GET_GROUPS, {
    variables: setVariables(),
  });

  // get the published flow list
  const [getFlows, { data: flowsData }] = useLazyQuery(GET_FLOWS, {
    variables: setVariables({
      status: FLOW_STATUS_PUBLISHED,
    }),
    fetchPolicy: 'network-only', // set for now, need to check cache issue
  });

  // get contact groups
  const [getContactGroups, { data }] = useLazyQuery(GET_CONTACT_GROUPS, {
    variables: { id: contactId },
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    getContactGroups();
  }, []);

  // mutation to update the contact groups
  const [updateContactGroups] = useMutation(UPDATE_CONTACT_GROUPS, {
    onCompleted: (result: any) => {
      const { numberDeleted, contactGroups } = result.updateContactGroups;
      const numberAdded = contactGroups.length;
      let notification = `Added to ${numberAdded} group${numberAdded === 1 ? '' : 's'}`;
      if (numberDeleted > 0 && numberAdded > 0) {
        notification = `Added to ${numberDeleted} group${
          numberDeleted === 1 ? '' : 's  and'
        } removed from ${numberAdded} group${numberAdded === 1 ? '' : 's '}`;
      } else if (numberDeleted > 0) {
        notification = `Removed from ${numberDeleted} group${numberDeleted === 1 ? '' : 's'}`;
      }
      setNotification(client, notification);
    },
    refetchQueries: [{ query: GET_CONTACT_GROUPS, variables: { id: contactId } }],
  });

  const [blockContact] = useMutation(UPDATE_CONTACT, {
    onCompleted: () => {
      setNotification(client, 'Contact blocked successfully');
    },
    refetchQueries: [{ query: SEARCH_QUERY, variables: SEARCH_QUERY_VARIABLES }],
  });

  const [addFlow] = useMutation(ADD_FLOW_TO_CONTACT, {
    onCompleted: () => {
      setShowFlowDialog(false);
      setNotification(client, 'Flow started successfully');
    },
  });

  // mutation to clear the chat messages of the contact
  const [clearMessages] = useMutation(CLEAR_MESSAGES, {
    variables: { contactId },
    onCompleted: () => {
      setClearChatDialog(false);
      setNotification(client, 'Conversation cleared for this contact', 'warning');
    },
  });

  let groupOptions = [];
  let flowOptions = [];
  let initialSelectedGroupIds: Array<any> = [];
  let selectedGroupsName = [];
  let assignedToGroup: any = [];

  if (data) {
    initialSelectedGroupIds = data.contact.contact.groups.map((group: any) => group.id);
    selectedGroupsName = data.contact.contact.groups.map((group: any) => group.label);
    assignedToGroup = data.contact.contact.groups.map((group: any) =>
      group.users.map((user: any) => user.name)
    );

    assignedToGroup = Array.from(new Set([].concat(...assignedToGroup)));
    if (assignedToGroup.length > 2) {
      assignedToGroup = `${assignedToGroup.slice(0, 2).join(', ')} +${(
        assignedToGroup.length - 2
      ).toString()}`;
    } else {
      assignedToGroup = assignedToGroup.join(', ');
    }
  }

  if (groupsData) {
    groupOptions = groupsData.groups;
  }

  if (flowsData) {
    flowOptions = flowsData.flows;
  }

  let dialogBox = null;

  const handleGroupDialogOk = (selectedGroupIds: any) => {
    const finalSelectedGroups = selectedGroupIds.filter(
      (groupId: any) => !initialSelectedGroupIds.includes(groupId)
    );
    const finalRemovedGroups = initialSelectedGroupIds.filter(
      (groupId: any) => !selectedGroupIds.includes(groupId)
    );

    if (finalSelectedGroups.length > 0 || finalRemovedGroups.length > 0) {
      updateContactGroups({
        variables: {
          input: {
            contactId: props.contactId,
            addGroupIds: finalSelectedGroups,
            deleteGroupIds: finalRemovedGroups,
          },
        },
      });
    }

    setShowGroupDialog(false);
  };

  const handleGroupDialogCancel = () => {
    setShowGroupDialog(false);
  };

  if (showGroupDialog) {
    dialogBox = (
      <SearchDialogBox
        selectedOptions={initialSelectedGroupIds}
        title="Add contact to group"
        handleOk={handleGroupDialogOk}
        handleCancel={handleGroupDialogCancel}
        options={groupOptions}
      />
    );
  }

  const handleFlowSubmit = (flowId: any) => {
    addFlow({
      variables: {
        flowId,
        contactId: props.contactId,
      },
    });
  };

  const closeFlowDialogBox = () => {
    setShowFlowDialog(false);
  };

  if (showFlowDialog) {
    dialogBox = (
      <DropdownDialog
        title="Select flow"
        handleOk={handleFlowSubmit}
        handleCancel={closeFlowDialogBox}
        options={flowOptions}
        placeholder="Select flow"
        description="The contact will be responded as per the messages planned in the flow."
      />
    );
  }

  const handleClearChatSubmit = () => {
    clearMessages();
    setClearChatDialog(false);
    props.handleAction();
  };

  if (showClearChatDialog) {
    const bodyContext =
      'All the conversation data for this contact will be deleted permanently from Glific. This action cannot be undone. However, you should be able to access it in reports if you have backup configuration enabled.';
    dialogBox = (
      <DialogBox
        title="Are you sure you want to clear all conversation for this contact?"
        handleOk={handleClearChatSubmit}
        handleCancel={() => setClearChatDialog(false)}
        alignButtons="center"
        buttonOk="YES, CLEAR"
        colorOk="secondary"
        buttonCancel="MAYBE LATER"
      >
        <p className={styles.DialogText}>{bodyContext}</p>
      </DialogBox>
    );
  }

  const handleBlock = () => {
    blockContact({
      variables: {
        id: props.contactId,
        input: {
          status: 'BLOCKED',
        },
      },
    });
  };

  if (showBlockDialog) {
    dialogBox = (
      <DialogBox
        title="Do you want to block this contact"
        handleOk={handleBlock}
        handleCancel={() => setShowBlockDialog(false)}
        alignButtons="center"
        colorOk="secondary"
      >
        <p className={styles.DialogText}>
          You will not be able to view their chats and interact with them again
        </p>
      </DialogBox>
    );
  }

  let flowButton: any;
  if (
    (contactBspStatus === 'SESSION' || contactBspStatus === 'SESSION_AND_HSM') &&
    !is24HourWindowOver(lastMessageTime)
  ) {
    flowButton = (
      <Button
        data-testid="flowButton"
        className={styles.ListButtonPrimary}
        onClick={() => {
          getFlows();
          setShowFlowDialog(true);
        }}
      >
        <FlowIcon className={styles.Icon} />
        Start a flow
      </Button>
    );
  } else {
    const toolTip = 'Option disabled because the 24hr window expired';
    flowButton = (
      <Tooltip title={toolTip} placement="right">
        <Button
          data-testid="disabledFlowButton"
          className={styles.ListButtonPrimary}
          onClick={() => {
            getFlows();
            setShowFlowDialog(true);
          }}
          disabled
        >
          <FlowUnselectedIcon className={styles.Icon} />
          Start a flow
        </Button>
      </Tooltip>
    );
  }

  const popper = (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-start"
      transition
      className={styles.Popper}
    >
      {({ TransitionProps }) => (
        <Fade {...TransitionProps} timeout={350}>
          <Paper elevation={3} className={styles.Container}>
            <Button
              className={styles.ListButtonPrimary}
              disabled={isSimulator}
              onClick={() => {
                history.push(`/contact-profile/${props.contactId}`);
              }}
            >
              {isSimulator ? (
                <ProfileDisabledIcon className={styles.Icon} />
              ) : (
                <ProfileIcon className={styles.Icon} />
              )}
              View contact profile
            </Button>

            {flowButton}
            <Button
              data-testid="groupButton"
              className={styles.ListButtonPrimary}
              onClick={() => {
                getGroups();
                setShowGroupDialog(true);
              }}
            >
              <AddContactIcon className={styles.Icon} />
              Add to group
            </Button>
            <Button
              className={styles.ListButtonPrimary}
              data-testid="clearChatButton"
              onClick={() => setClearChatDialog(true)}
            >
              <ClearConversation className={styles.Icon} />
              Clear conversation
            </Button>
            <Button
              data-testid="blockButton"
              className={styles.ListButtonDanger}
              color="secondary"
              disabled={isSimulator}
              onClick={() => setShowBlockDialog(true)}
            >
              {isSimulator ? (
                <BlockDisabledIcon className={styles.Icon} />
              ) : (
                <BlockIcon className={styles.Icon} />
              )}
              Block Contact
            </Button>
          </Paper>
        </Fade>
      )}
    </Popper>
  );

  const handleConfigureIconClick = (event: any) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const selectContact = () => {
    document.querySelector('.chatMessages')?.setAttribute('style', 'display: none ');
    document
      .querySelector('.chatConversations')
      ?.setAttribute('style', 'display: block !important');
  };

  let contactGroups: any;
  if (selectedGroupsName.length > 0) {
    contactGroups = (
      <div className={styles.ContactGroups}>
        <span className={styles.GroupHeading}>Groups</span>
        <span className={styles.GroupsName} data-testid="groupNames">
          {selectedGroupsName.map((groupName: string) => groupName).join(', ')}
        </span>
      </div>
    );
  }

  const sesssionAndGroupAssignedTo = (
    <>
      <div className={styles.SessionTimerContainer}>
        <div className={styles.SessionTimer} data-testid="sessionTimer">
          <span>Session Timer</span>
          <Timer
            time={lastMessageTime}
            contactStatus={contactStatus}
            contactBspStatus={contactBspStatus}
          />
        </div>
        <div>
          {assignedToGroup ? (
            <>
              <span className={styles.GroupHeading}>Assigned to</span>
              <span className={styles.GroupsName}>{assignedToGroup}</span>
            </>
          ) : null}
        </div>
      </div>
      <div className={styles.Chat} onClick={() => selectContact()} aria-hidden="true">
        <IconButton className={styles.Icon}>
          <ChatIcon />
        </IconButton>

        <div className={styles.TitleText}>Chats</div>
      </div>
    </>
  );
  return (
    <Toolbar className={styles.ContactBar} color="primary">
      <div>
        <div className={styles.ContactDetails}>
          <Typography className={styles.Title} variant="h6" noWrap data-testid="beneficiaryName">
            {contactName}
          </Typography>
          <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
            <div className={styles.Configure} data-testid="dropdownIcon">
              <DropdownIcon onClick={handleConfigureIconClick} />
            </div>
          </ClickAwayListener>
        </div>
        {contactGroups}
      </div>
      {sesssionAndGroupAssignedTo}
      {popper}
      {dialogBox}
    </Toolbar>
  );
};

export default ContactBar;
