import React, { useState } from 'react';
import {
  Toolbar,
  Typography,
  Popper,
  Fade,
  Paper,
  Button,
  ClickAwayListener,
} from '@material-ui/core';
import { Link } from 'react-router-dom';
import { useMutation, useLazyQuery, useApolloClient, useQuery } from '@apollo/client';

import { SearchDialogBox } from '../../../../components/UI/SearchDialogBox/SearchDialogBox';
import { ReactComponent as DropdownIcon } from '../../../../assets/images/icons/BrownDropdown.svg';
import { ReactComponent as AddContactIcon } from '../../../../assets/images/icons/Contact/Light.svg';
import { ReactComponent as BlockIcon } from '../../../../assets/images/icons/Block.svg';
import { ReactComponent as ProfileIcon } from '../../../../assets/images/icons/Contact/Profile.svg';
import { ReactComponent as AutomationIcon } from '../../../../assets/images/icons/Automations/Dark.svg';
import { ReactComponent as AutomationUnselectedIcon } from '../../../../assets/images/icons/Automations/Unselected.svg';
import styles from './ContactBar.module.css';
import { GET_GROUPS } from '../../../../graphql/queries/Group';
import { UPDATE_CONTACT_GROUPS } from '../../../../graphql/mutations/Group';
import { GET_CONTACT_GROUPS } from '../../../../graphql/queries/Contact';
import { GET_AUTOMATIONS } from '../../../../graphql/queries/Automation';
import { ADD_AUTOMATION_TO_CONTACT } from '../../../../graphql/mutations/Automation';
import { UPDATE_CONTACT } from '../../../../graphql/mutations/Contact';
import { SEARCH_QUERY } from '../../../../graphql/queries/Search';
import { setNotification } from '../../../../common/notification';
import { SEARCH_QUERY_VARIABLES, setVariables } from '../../../../common/constants';
import { Timer } from '../../../../components/UI/Timer/Timer';
import { DropdownDialog } from '../../../../components/UI/DropdownDialog/DropdownDialog';
import { DialogBox } from '../../../../components/UI/DialogBox/DialogBox';
import { Tooltip } from '../../../../components/UI/Tooltip/Tooltip';

export interface ContactBarProps {
  contactName: string;
  contactId: string;
  lastMessageTime: any;
  contactStatus: string;
  contactBspStatus: string;
}

export const ContactBar: React.SFC<ContactBarProps> = (props) => {
  const client = useApolloClient();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [showGroupDialog, setShowGroupDialog] = useState(false);
  const [showAutomationDialog, setShowAutomationDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);

  // get group list
  const [getGroups, { data: groupsData }] = useLazyQuery(GET_GROUPS, {
    variables: setVariables(),
  });

  // get automation list
  const [getAutomations, { data: automationsData }] = useLazyQuery(GET_AUTOMATIONS, {
    variables: setVariables(),
  });

  // get contact groups
  const { data, refetch } = useQuery(GET_CONTACT_GROUPS, {
    variables: { id: props.contactId },
    fetchPolicy: 'cache-and-network',
  });

  // mutation to update the contact groups
  const [updateContactGroups] = useMutation(UPDATE_CONTACT_GROUPS, {
    onCompleted: () => refetch(),
  });

  const [blockContact] = useMutation(UPDATE_CONTACT, {
    onCompleted: () => {
      setNotification(client, 'Contact blocked successfully');
    },
    refetchQueries: [{ query: SEARCH_QUERY, variables: SEARCH_QUERY_VARIABLES }],
  });

  const [addAutomation] = useMutation(ADD_AUTOMATION_TO_CONTACT, {
    onCompleted: (data) => {
      setShowAutomationDialog(false);
      setNotification(client, 'Automation started successfully');
    },
  });

  let groupOptions = [];
  let automationOptions = [];
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
      assignedToGroup =
        assignedToGroup.slice(0, 2).join(', ') + ' +' + (assignedToGroup.length - 2).toString();
    } else {
      assignedToGroup = assignedToGroup.join(', ');
    }
  }

  if (groupsData) {
    groupOptions = groupsData.groups;
  }

  if (automationsData) {
    automationOptions = automationsData.flows;
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

    if (finalSelectedGroups.length > 0) {
      setNotification(client, 'Added to group succesfully');
    } else if (finalRemovedGroups.length > 0) {
      setNotification(client, 'Removed from group succesfully');
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
      ></SearchDialogBox>
    );
  }

  const handleAutomationSubmit = (automationId: any) => {
    addAutomation({
      variables: {
        flowId: automationId,
        contactId: props.contactId,
      },
    });
  };

  const closeAutomationDialogBox = () => {
    setShowAutomationDialog(false);
  };

  if (showAutomationDialog) {
    dialogBox = (
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
        alignButtons={'center'}
        colorOk="secondary"
      >
        <p className={styles.DialogText}>
          You will not be able to view their chats and interact with them again
        </p>
      </DialogBox>
    );
  }

  let automationButton: any;
  if (props.contactBspStatus === 'SESSION' || props.contactBspStatus === 'SESSION_AND_HSM') {
    automationButton = (
      <Button
        className={styles.ListButtonPrimary}
        onClick={() => {
          getAutomations();
          setShowAutomationDialog(true);
        }}
      >
        <AutomationIcon className={styles.Icon} />
        Start automation flow
      </Button>
    );
  } else {
    const toolTip = 'Option disabled because the 24hr window expired';
    automationButton = (
      <Tooltip title={toolTip} placement="right">
        <Button
          className={styles.ListButtonPrimary}
          onClick={() => {
            getAutomations();
            setShowAutomationDialog(true);
          }}
          disabled
        >
          <AutomationUnselectedIcon className={styles.Icon} />
          Start automation flow
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
            <Link to={`/contact-profile/${props.contactId}`} className={styles.Link}>
              <Button className={styles.ListButtonPrimary}>
                <ProfileIcon className={styles.Icon} />
                View contact profile
              </Button>
            </Link>
            {automationButton}
            <Button
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
              className={styles.ListButtonDanger}
              color="secondary"
              onClick={() => setShowBlockDialog(true)}
            >
              <BlockIcon className={styles.Icon} />
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
    <div className={styles.Container}>
      <div className={styles.SessionTimer} data-testid="sessionTimer">
        <span>Session Timer</span>
        <Timer
          time={props.lastMessageTime}
          contactStatus={props.contactStatus}
          contactBspStatus={props.contactBspStatus}
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
  );
  return (
    <Toolbar className={styles.ContactBar} color="primary">
      <div>
        <div className={styles.ContactDetails}>
          <Typography className={styles.Title} variant="h6" noWrap data-testid="beneficiaryName">
            {props.contactName}
          </Typography>
          <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
            <div className={styles.Configure}>
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
