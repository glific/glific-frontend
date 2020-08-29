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
import { SearchDialogBox } from '../../../../components/UI/SearchDialogBox/SearchDialogBox';
import { ReactComponent as DropdownIcon } from '../../../../assets/images/icons/BrownDropdown.svg';
import { ReactComponent as AddContactIcon } from '../../../../assets/images/icons/Contact/Light.svg';
import { ReactComponent as BlockIcon } from '../../../../assets/images/icons/Block.svg';
import { Link } from 'react-router-dom';
import styles from './ContactBar.module.css';
import { useMutation, useLazyQuery, useApolloClient, useQuery, gql } from '@apollo/client';
import { GET_GROUPS } from '../../../../graphql/queries/Group';
import { UPDATE_CONTACT_GROUPS } from '../../../../graphql/mutations/Group';
import { GET_CONTACT_GROUPS } from '../../../../graphql/queries/Contact';
import { setNotification } from '../../../../common/notification';
import { Timer } from '../../../../components/UI/Timer/Timer';

export interface ContactBarProps {
  contactName: string;
  contactId: string;
  lastMessageTime: any;
}

export const ContactBar: React.SFC<ContactBarProps> = (props) => {
  const client = useApolloClient();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [showDialog, setShowDialog] = useState(false);

  // get group list
  const [groups, { data: groupsData }] = useLazyQuery(GET_GROUPS);

  // get contact groups
  const { data, refetch, loading } = useQuery(GET_CONTACT_GROUPS, {
    variables: { id: props.contactId },
    fetchPolicy: 'cache-and-network',
  });

  // mutation to update the contact groups
  const [updateContactGroups] = useMutation(UPDATE_CONTACT_GROUPS, {
    onCompleted: () => refetch(),
  });

  let options = [];
  let initialSelectedGroupIds: Array<any> = [];
  let selectedGroupsName = [];

  if (data) {
    initialSelectedGroupIds = data.contact.contact.groups.map((group: any) => group.id);
    selectedGroupsName = data.contact.contact.groups.map((group: any) => group.label);
  }
  if (groupsData) {
    options = groupsData.groups;
  }

  let dialogBox = null;

  const handleDialogOk = (selectedGroupIds: any) => {
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

    setShowDialog(false);
  };

  const handleDialogCancel = () => {
    setShowDialog(false);
  };

  if (showDialog) {
    dialogBox = (
      <SearchDialogBox
        selectedOptions={initialSelectedGroupIds}
        title="Add contact to group"
        handleOk={handleDialogOk}
        handleCancel={handleDialogCancel}
        options={options}
      ></SearchDialogBox>
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
              onClick={() => {
                groups();

                setShowDialog(true);
              }}
            >
              <AddContactIcon className={styles.Icon} />
              Add to group
            </Button>

            <br />
            <Link to={'/staff-management'} className={styles.Link}>
              <Button
                className={styles.ListButton}
                color="secondary"
                onClick={() => setAnchorEl(null)}
              >
                <BlockIcon className={styles.Icon} />
                Block Contact
              </Button>
            </Link>
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

  const sessionTimer = (
    <div className={styles.SessionTimer} data-testid="sessionTimer">
      <span>Session Timer</span>
      <Timer time={props.lastMessageTime} />
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
      {sessionTimer}
      {popper}
      {dialogBox}
    </Toolbar>
  );
};

export default ContactBar;
