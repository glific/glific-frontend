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

import { useMutation, useLazyQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { ReactComponent as TerminateFlowIcon } from 'assets/images/icons/Automations/Terminate.svg';
import styles from './ContactBar.module.css';
import { SearchDialogBox } from '../../../../components/UI/SearchDialogBox/SearchDialogBox';
import { TerminateFlow } from './TerminateFlow/TerminateFlow';

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
import { ReactComponent as CollectionIcon } from '../../../../assets/images/icons/Chat/SelectedCollection.svg';
import { ReactComponent as SavedSearchIcon } from '../../../../assets/images/icons/Chat/SelectedSavedSearch.svg';

import { GET_COLLECTIONS } from '../../../../graphql/queries/Collection';
import { UPDATE_CONTACT_COLLECTIONS } from '../../../../graphql/mutations/Collection';
import { GET_CONTACT_COLLECTIONS } from '../../../../graphql/queries/Contact';
import { GET_FLOWS } from '../../../../graphql/queries/Flow';
import { ADD_FLOW_TO_CONTACT, ADD_FLOW_TO_COLLECTION } from '../../../../graphql/mutations/Flow';
import { UPDATE_CONTACT } from '../../../../graphql/mutations/Contact';
import { SEARCH_QUERY } from '../../../../graphql/queries/Search';
import { setErrorMessage, setNotification } from '../../../../common/notification';
import {
  FLOW_STATUS_PUBLISHED,
  is24HourWindowOver,
  SEARCH_QUERY_VARIABLES,
  setVariables,
} from '../../../../common/constants';
import { Timer } from '../../../../components/UI/Timer/Timer';
import { DialogBox } from '../../../../components/UI/DialogBox/DialogBox';
import { Tooltip } from '../../../../components/UI/Tooltip/Tooltip';
import { CLEAR_MESSAGES } from '../../../../graphql/mutations/Chat';
import { showChats } from '../../../../common/responsive';
import { CollectionInformation } from '../../../Collection/CollectionInformation/CollectionInformation';
import AddContactsToCollection from '../AddContactsToCollection/AddContactsToCollection';

const status = ['SESSION', 'SESSION_AND_HSM', 'HSM'];

export const shortenMultipleItems = (multipleItems: Array<string>) => {
  if (multipleItems.length > 2) {
    return (
      <span>
        {multipleItems.slice(0, 2).join(', ')}
        <Tooltip title={multipleItems.slice(2).join(', ')} placement="right">
          <span> +{(multipleItems.length - 2).toString()}</span>
        </Tooltip>
      </span>
    );
  }
  return multipleItems.join(', ');
};

export interface ContactBarProps {
  displayName: string;
  contactId?: string;
  collectionId?: string;
  lastMessageTime?: any;
  contactStatus?: string;
  contactBspStatus?: string;
  handleAction: any;
  isSimulator?: boolean;
}

export const ContactBar: React.SFC<ContactBarProps> = (props) => {
  const {
    contactId,
    collectionId,
    contactBspStatus,
    lastMessageTime,
    contactStatus,
    displayName,
    handleAction,
    isSimulator,
  } = props;

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const history = useHistory();
  const [showCollectionDialog, setShowCollectionDialog] = useState(false);
  const [showFlowDialog, setShowFlowDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showClearChatDialog, setClearChatDialog] = useState(false);
  const [addContactsDialogShow, setAddContactsDialogShow] = useState(false);
  const [showTerminateDialog, setShowTerminateDialog] = useState(false);
  const { t } = useTranslation();

  // get collection list
  const [getCollections, { data: collectionsData }] = useLazyQuery(GET_COLLECTIONS, {
    variables: setVariables(),
  });

  // get the published flow list
  const [getFlows, { data: flowsData }] = useLazyQuery(GET_FLOWS, {
    variables: setVariables({
      status: FLOW_STATUS_PUBLISHED,
      isActive: true,
    }),
    fetchPolicy: 'network-only', // set for now, need to check cache issue
  });

  // get contact collections
  const [getContactCollections, { data }] = useLazyQuery(GET_CONTACT_COLLECTIONS, {
    variables: { id: contactId },
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    if (contactId) {
      getContactCollections();
    }
  }, [contactId]);

  // mutation to update the contact collections
  const [updateContactCollections] = useMutation(UPDATE_CONTACT_COLLECTIONS, {
    onCompleted: (result: any) => {
      const { numberDeleted, contactGroups } = result.updateContactGroups;
      const numberAdded = contactGroups.length;
      let notification = `Added to ${numberAdded} collection${numberAdded === 1 ? '' : 's'}`;
      if (numberDeleted > 0 && numberAdded > 0) {
        notification = `Added to ${numberDeleted} collection${
          numberDeleted === 1 ? '' : 's  and'
        } removed from ${numberAdded} collection${numberAdded === 1 ? '' : 's '}`;
      } else if (numberDeleted > 0) {
        notification = `Removed from ${numberDeleted} collection${numberDeleted === 1 ? '' : 's'}`;
      }
      setNotification(notification);
    },
    refetchQueries: [{ query: GET_CONTACT_COLLECTIONS, variables: { id: contactId } }],
  });

  const [blockContact] = useMutation(UPDATE_CONTACT, {
    onCompleted: () => {
      setNotification(t('Contact blocked successfully.'));
    },
    refetchQueries: [{ query: SEARCH_QUERY, variables: SEARCH_QUERY_VARIABLES }],
  });

  const [addFlow] = useMutation(ADD_FLOW_TO_CONTACT, {
    onCompleted: () => {
      setNotification(t('Flow started successfully.'));
    },
    onError: (error) => {
      setErrorMessage(error);
    },
  });

  const [addFlowToCollection] = useMutation(ADD_FLOW_TO_COLLECTION, {
    onCompleted: () => {
      setNotification(t('Your flow will start in a couple of minutes.'));
    },
  });

  // mutation to clear the chat messages of the contact
  const [clearMessages] = useMutation(CLEAR_MESSAGES, {
    variables: { contactId },
    onCompleted: () => {
      setClearChatDialog(false);
      setNotification(t('Conversation cleared for this contact.'), 'warning');
    },
  });

  let collectionOptions = [];
  let flowOptions = [];
  let initialSelectedCollectionIds: Array<any> = [];
  let selectedCollectionsName;
  let selectedCollections: any = [];
  let assignedToCollection: any = [];

  if (data) {
    const { groups } = data.contact.contact;
    initialSelectedCollectionIds = groups.map((group: any) => group.id);

    selectedCollections = groups.map((group: any) => group.label);
    selectedCollectionsName = shortenMultipleItems(selectedCollections);

    assignedToCollection = groups.map((group: any) => group.users.map((user: any) => user.name));
    assignedToCollection = Array.from(new Set([].concat(...assignedToCollection)));
    assignedToCollection = shortenMultipleItems(assignedToCollection);
  }

  if (collectionsData) {
    collectionOptions = collectionsData.groups;
  }

  if (flowsData) {
    flowOptions = flowsData.flows;
  }

  let dialogBox = null;

  const handleCollectionDialogOk = (selectedCollectionIds: any) => {
    const finalSelectedCollections = selectedCollectionIds.filter(
      (selectedCollectionId: any) => !initialSelectedCollectionIds.includes(selectedCollectionId)
    );
    const finalRemovedCollections = initialSelectedCollectionIds.filter(
      (gId: any) => !selectedCollectionIds.includes(gId)
    );

    if (finalSelectedCollections.length > 0 || finalRemovedCollections.length > 0) {
      updateContactCollections({
        variables: {
          input: {
            contactId,
            addGroupIds: finalSelectedCollections,
            deleteGroupIds: finalRemovedCollections,
          },
        },
      });
    }

    setShowCollectionDialog(false);
  };

  const handleCollectionDialogCancel = () => {
    setShowCollectionDialog(false);
  };

  if (showCollectionDialog) {
    dialogBox = (
      <SearchDialogBox
        selectedOptions={initialSelectedCollectionIds}
        title={t('Add contact to collection')}
        handleOk={handleCollectionDialogOk}
        handleCancel={handleCollectionDialogCancel}
        options={collectionOptions}
      />
    );
  }

  const handleFlowSubmit = (flowId: any) => {
    if (!flowId) return;
    const flowVariables: any = {
      flowId,
    };

    if (contactId) {
      flowVariables.contactId = contactId;
      addFlow({
        variables: flowVariables,
      });
    }

    if (collectionId) {
      flowVariables.groupId = collectionId;
      addFlowToCollection({
        variables: flowVariables,
      });
    }

    setShowFlowDialog(false);
  };

  const closeFlowDialogBox = () => {
    setShowFlowDialog(false);
  };

  if (showFlowDialog) {
    dialogBox = (
      <SearchDialogBox
        title={t('Select flow')}
        handleOk={handleFlowSubmit}
        handleCancel={closeFlowDialogBox}
        options={flowOptions}
        optionLabel="name"
        multiple={false}
        buttonOk="Start"
        searchLabel={t('Select flow')}
        description={t('The contact will be responded as per the messages planned in the flow.')}
      />
    );
  }

  const handleClearChatSubmit = () => {
    clearMessages();
    setClearChatDialog(false);
    handleAction();
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
        id: contactId,
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

  if (showTerminateDialog) {
    dialogBox = <TerminateFlow contactId={contactId} setDialog={setShowTerminateDialog} />;
  }

  let flowButton: any;

  const blockContactButton = contactId ? (
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
  ) : null;

  if (collectionId) {
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
  } else if (
    contactBspStatus &&
    status.includes(contactBspStatus) &&
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
    let toolTip = 'Option disabled because the 24hr window expired';
    let disabled = true;
    // if 24hr window expired & contact type HSM. we can start flow with template msg .
    if (contactBspStatus === 'HSM') {
      toolTip =
        'Since the 24-hour window has passed, the contact will only receive a template message.';
      disabled = false;
    }
    flowButton = (
      <Tooltip title={toolTip} placement="right">
        <span>
          <Button
            data-testid="disabledFlowButton"
            className={styles.ListButtonPrimary}
            disabled={disabled}
            onClick={() => {
              getFlows();
              setShowFlowDialog(true);
            }}
          >
            {disabled ? (
              <FlowUnselectedIcon className={styles.Icon} />
            ) : (
              <FlowIcon className={styles.Icon} />
            )}
            Start a flow
          </Button>
        </span>
      </Tooltip>
    );
  }

  const terminateFLows = contactId ? (
    <Button
      data-testid="terminateButton"
      className={styles.ListButtonPrimary}
      onClick={() => {
        setShowTerminateDialog(!showTerminateDialog);
      }}
    >
      <TerminateFlowIcon className={styles.Icon} />
      Terminate flows
    </Button>
  ) : null;

  const viewDetails = contactId ? (
    <Button
      className={styles.ListButtonPrimary}
      disabled={isSimulator}
      data-testid="viewProfile"
      onClick={() => {
        history.push(`/contact-profile/${contactId}`);
      }}
    >
      {isSimulator ? (
        <ProfileDisabledIcon className={styles.Icon} />
      ) : (
        <ProfileIcon className={styles.Icon} />
      )}
      View contact profile
    </Button>
  ) : (
    <Button
      className={styles.ListButtonPrimary}
      data-testid="viewContacts"
      onClick={() => {
        history.push(`/collection/${collectionId}/contacts`);
      }}
    >
      <ProfileIcon className={styles.Icon} />
      View details
    </Button>
  );

  const addMember = contactId ? (
    <>
      <Button
        data-testid="collectionButton"
        className={styles.ListButtonPrimary}
        onClick={() => {
          getCollections();
          setShowCollectionDialog(true);
        }}
      >
        <AddContactIcon className={styles.Icon} />
        Add to collection
      </Button>
      <Button
        className={styles.ListButtonPrimary}
        data-testid="clearChatButton"
        onClick={() => setClearChatDialog(true)}
      >
        <ClearConversation className={styles.Icon} />
        Clear conversation
      </Button>
    </>
  ) : (
    <Button
      data-testid="collectionButton"
      className={styles.ListButtonPrimary}
      onClick={() => {
        setAddContactsDialogShow(true);
      }}
    >
      <AddContactIcon className={styles.Icon} />
      Add contact
    </Button>
  );

  if (addContactsDialogShow) {
    dialogBox = (
      <AddContactsToCollection collectionId={collectionId} setDialog={setAddContactsDialogShow} />
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
            {viewDetails}
            {flowButton}

            {addMember}
            {terminateFLows}
            {blockContactButton}
          </Paper>
        </Fade>
      )}
    </Popper>
  );

  const handleConfigureIconClick = (event: any) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  let contactCollections: any;
  if (selectedCollections.length > 0) {
    contactCollections = (
      <div className={styles.ContactCollections}>
        <span className={styles.CollectionHeading}>Collections</span>
        <span className={styles.CollectionsName} data-testid="collectionNames">
          {selectedCollectionsName}
        </span>
      </div>
    );
  }

  const getTitleAndIconForSmallScreen = (() => {
    const { location } = history;

    if (location.pathname.includes('collection')) {
      return CollectionIcon;
    }

    if (location.pathname.includes('saved-searches')) {
      return SavedSearchIcon;
    }

    return ChatIcon;
  })();

  // CONTACT: display session timer & Assigned to
  const IconComponent = getTitleAndIconForSmallScreen;
  const sessionAndCollectionAssignedTo = (
    <>
      {contactId ? (
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
            {assignedToCollection ? (
              <>
                <span className={styles.CollectionHeading}>Assigned to</span>
                <span className={styles.CollectionsName}>{assignedToCollection}</span>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
      <div className={styles.Chat} onClick={() => showChats()} aria-hidden="true">
        <IconButton className={styles.MobileIcon}>
          <IconComponent />
        </IconButton>
      </div>
    </>
  );

  // COLLECTION: display contact info & Assigned to
  let collectionStatus: any;
  if (collectionId) {
    collectionStatus = <CollectionInformation collectionId={collectionId} />;
  }

  return (
    <Toolbar className={styles.ContactBar} color="primary">
      <div className={styles.ContactBarWrapper}>
        <div className={styles.ContactInfoContainer}>
          <div className={styles.ContactInfoWrapper}>
            <div className={styles.InfoWrapperRight}>
              <div className={styles.ContactDetails}>
                <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
                  <div
                    className={styles.Configure}
                    data-testid="dropdownIcon"
                    onClick={handleConfigureIconClick}
                    onKeyPress={handleConfigureIconClick}
                    aria-hidden
                  >
                    <DropdownIcon />
                  </div>
                </ClickAwayListener>
                <Typography
                  className={styles.Title}
                  variant="h6"
                  noWrap
                  data-testid="beneficiaryName"
                >
                  {displayName}
                </Typography>
              </div>
              {contactCollections}
            </div>
            {collectionStatus}
            {sessionAndCollectionAssignedTo}
          </div>
        </div>
      </div>
      {popper}
      {dialogBox}
    </Toolbar>
  );
};

export default ContactBar;
