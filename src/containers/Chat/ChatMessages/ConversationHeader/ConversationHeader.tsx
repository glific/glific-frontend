import { useEffect, useState } from 'react';
import {
  Toolbar,
  Typography,
  Popper,
  Fade,
  Paper,
  Button,
  ClickAwayListener,
  IconButton,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation, useLazyQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';

import TerminateFlowIcon from 'assets/images/icons/Automations/Terminate.svg?react';
import ExpandIcon from 'assets/images/icons/Expand.svg?react';
import AddContactIcon from 'assets/images/icons/Contact/Light.svg?react';
import BlockIcon from 'assets/images/icons/Block.svg?react';
import BlockDisabledIcon from 'assets/images/icons/BlockDisabled.svg?react';
import ProfileIcon from 'assets/images/icons/Contact/Profile.svg?react';
import FlowIcon from 'assets/images/icons/Flow/Dark.svg?react';
import FlowUnselectedIcon from 'assets/images/icons/Flow/Unselected.svg?react';
import ClearConversation from 'assets/images/icons/Chat/ClearConversation.svg?react';
import ChatIcon from 'assets/images/icons/Chat/UnselectedDark.svg?react';
import CollectionIcon from 'assets/images/icons/Chat/SelectedCollection.svg?react';
import SavedSearchIcon from 'assets/images/icons/Chat/SelectedSavedSearch.svg?react';

import { GET_COLLECTIONS } from 'graphql/queries/Collection';
import { UPDATE_CONTACT_COLLECTIONS } from 'graphql/mutations/Collection';
import { GET_CONTACT_COLLECTIONS } from 'graphql/queries/Contact';
import { GET_FLOWS } from 'graphql/queries/Flow';
import { ADD_FLOW_TO_CONTACT, ADD_FLOW_TO_COLLECTION } from 'graphql/mutations/Flow';
import { UPDATE_CONTACT } from 'graphql/mutations/Contact';
import { SEARCH_QUERY } from 'graphql/queries/Search';
import { CLEAR_MESSAGES } from 'graphql/mutations/Chat';
import { setErrorMessage, setNotification } from 'common/notification';
import {
  FLOW_STATUS_PUBLISHED,
  is24HourWindowOver,
  SEARCH_QUERY_VARIABLES,
  setVariables,
} from 'common/constants';
import { Timer } from 'components/UI/Timer/Timer';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { Tooltip } from 'components/UI/Tooltip/Tooltip';
import { SearchDialogBox } from 'components/UI/SearchDialogBox/SearchDialogBox';
import { TerminateFlow } from './TerminateFlow/TerminateFlow';
import { showChats } from 'common/responsive';
import { slicedString } from 'common/utils';
import { CollectionInformation } from '../../../Collection/CollectionInformation/CollectionInformation';
import AddContactsToCollection from '../AddContactsToCollection/AddContactsToCollection';

import styles from './ConversationHeader.module.css';

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

export interface ConversationHeaderProps {
  displayName: string;
  entityId?: string;
  collectionId?: string;
  handleAction: any;
  isSimulator?: boolean;
  groups?: boolean;
  contact?: {
    contactStatus?: any;
    lastMessageTime?: any;
    contactBspStatus?: any;
  };
}

export const ConversationHeader = ({
  entityId,
  collectionId,
  displayName,
  handleAction,
  isSimulator,
  groups = false,
  contact,
}: ConversationHeaderProps) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  const location = useLocation();
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
    variables: { id: entityId },
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    if (entityId) {
      getContactCollections();
    }
  }, [entityId]);

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
    refetchQueries: [{ query: GET_CONTACT_COLLECTIONS, variables: { id: entityId } }],
  });

  const [blockContact] = useMutation(UPDATE_CONTACT, {
    onCompleted: () => {
      setShowBlockDialog(false);
      setNotification(t('Contact blocked successfully.'));
    },
    refetchQueries: [{ query: SEARCH_QUERY, variables: SEARCH_QUERY_VARIABLES }],
    onError: () => {
      setShowBlockDialog(false);
      setNotification(t('Sorry! An error occurred!'), 'warning');
    },
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
    variables: { contactId: entityId },
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

  if (data && !groups) {
    const { groups } = data.contact.contact;
    initialSelectedCollectionIds = groups.map((group: any) => group.id);

    selectedCollections = groups.map((group: any) => group.label);
    selectedCollectionsName = shortenMultipleItems(selectedCollections);
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
            contactId: entityId,
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

    if (entityId) {
      flowVariables.contactId = entityId;
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
        textFieldPlaceholder={t('Select flow')}
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
        titleAlign="left"
        buttonOk="YES, CLEAR"
        colorOk="warning"
        buttonCancel="MAYBE LATER"
      >
        <p className={styles.DialogText}>{bodyContext}</p>
      </DialogBox>
    );
  }

  const handleBlock = () => {
    blockContact({
      variables: {
        id: entityId,
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
        colorOk="warning"
      >
        <p className={styles.DialogText}>
          You will not be able to view their chats and interact with them again
        </p>
      </DialogBox>
    );
  }

  if (showTerminateDialog) {
    dialogBox = <TerminateFlow contactId={entityId} setDialog={setShowTerminateDialog} />;
  }

  let flowButton: any;

  const blockContactButton = entityId ? (
    <Button
      data-testid="blockButton"
      className={styles.ListButtonDanger}
      color="warning"
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
    contact?.contactBspStatus &&
    status.includes(contact?.contactBspStatus) &&
    !is24HourWindowOver(contact?.lastMessageTime)
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
    if (contact?.contactBspStatus === 'HSM') {
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

  const terminateFLows = entityId ? (
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

  const viewDetails = entityId ? (
    <Button
      className={styles.ListButtonPrimary}
      data-testid="viewProfile"
      onClick={() => {
        if (groups) {
          navigate(`/group-details/${entityId}`);
        } else {
          navigate(`/contact-profile/${entityId}`);
        }
      }}
    >
      <ProfileIcon className={styles.Icon} />
      {groups ? 'View group details' : 'View contact profile'}
    </Button>
  ) : (
    <Button
      className={styles.ListButtonPrimary}
      data-testid="viewContacts"
      onClick={() => {
        navigate(`/collection/${collectionId}/contacts`);
      }}
    >
      <ProfileIcon className={styles.Icon} />
      View details
    </Button>
  );

  const addMember = entityId ? (
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

  let options: any;
  if (groups) {
    options = <>{viewDetails}</>;
  } else {
    options = (
      <>
        {viewDetails}
        {flowButton}
        {addMember}
        {terminateFLows}
        {blockContactButton}
      </>
    );
  }

  const popper = (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-start"
      transition
      disablePortal
      className={styles.Popper}
    >
      {({ TransitionProps }) => (
        <Fade {...TransitionProps} timeout={350}>
          <Paper elevation={3} className={styles.Container}>
            {options}
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
      <div className={styles.SessionTimer}>
        <span>Collections:</span>
        <span className={styles.CollectionsName} data-testid="collectionNames">
          {selectedCollectionsName}
        </span>
      </div>
    );
  }

  let timeleft: any;
  timeleft = (
    <div className={styles.SessionTimer} data-testid="sessionTimer">
      <span>Time left:</span>
      <Timer
        time={contact?.lastMessageTime}
        contactStatus={contact?.contactStatus}
        contactBspStatus={contact?.contactBspStatus}
        variant="secondary"
      />
    </div>
  );

  const getTitleAndIconForSmallScreen = (() => {
    if (location.pathname.includes('collection')) {
      return CollectionIcon;
    }

    if (location.pathname.includes('saved-searches')) {
      return SavedSearchIcon;
    }

    return ChatIcon;
  })();

  const IconComponent = getTitleAndIconForSmallScreen;

  // CONTACT: display session timer & Assigned to
  // COLLECTION: display contact info & Assigned to
  // GROUP: display Assigned to
  let conversationHeaderDetails: any;

  if (entityId) {
    conversationHeaderDetails = (
      <>
        <div className={styles.SessionTimerContainer}>
          {contactCollections}
          {!groups && timeleft}
        </div>
      </>
    );
  } else if (collectionId) {
    conversationHeaderDetails = <CollectionInformation collectionId={collectionId} />;
  }

  return (
    <Toolbar className={styles.ConversationHeader} color="primary">
      <div className={styles.ConversationHeaderWrapper}>
        <div className={styles.ContactInfoContainer}>
          <div className={styles.ContactInfoWrapper}>
            <div className={styles.InfoWrapperRight}>
              <div className={styles.ContactDetails}>
                <Typography
                  className={styles.Title}
                  variant="h6"
                  noWrap
                  data-testid="beneficiaryName"
                >
                  {slicedString(displayName, 40)}
                </Typography>
                <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
                  <div
                    className={styles.Configure}
                    data-testid="dropdownIcon"
                    onClick={handleConfigureIconClick}
                    onKeyPress={handleConfigureIconClick}
                    aria-hidden
                  >
                    <ExpandIcon />
                  </div>
                </ClickAwayListener>
              </div>
            </div>
            {conversationHeaderDetails}
            <div className={styles.Chat} onClick={() => showChats()}>
              <IconButton className={styles.MobileIcon}>
                <IconComponent data-testid="icon-component" />
              </IconButton>
            </div>
          </div>
        </div>
      </div>
      {popper}
      {dialogBox}
    </Toolbar>
  );
};

export default ConversationHeader;
