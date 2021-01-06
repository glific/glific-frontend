import React, { useState, useEffect } from 'react';
import { Paper, Toolbar, Typography } from '@material-ui/core';
import { useQuery } from '@apollo/client';
// import { Redirect } from 'react-router-dom';

import styles from './Chat.module.css';
import { Simulator } from '../../components/simulator/Simulator';
import ChatMessages from './ChatMessages/ChatMessages';
import ChatConversations from './ChatConversations/ChatConversations';
import Loading from '../../components/UI/Layout/Loading/Loading';
import { SEARCH_QUERY } from '../../graphql/queries/Search';
import { setErrorMessage } from '../../common/notification';
import { getUserRole } from '../../context/role';
import { SEARCH_QUERY_VARIABLES, SIMULATOR_CONTACT } from '../../common/constants';
import selectedChatIcon from '../../assets/images/icons/Chat/Selected.svg';
import CollectionConversations from './CollectionConversations/CollectionConversations';

export interface ChatProps {
  contactId?: number;
  groupId?: number;
}

export const Chat: React.SFC<ChatProps> = ({ contactId, groupId }) => {
  const [simulatorAccess, setSimulatorAccess] = useState(true);
  const [showSimulator, setShowSimulator] = useState(false);
  const [selectedTab, setSelectedTab] = useState('contacts');
  let simulatorId: string | null = null;

  // default queryvariables
  const queryVariables = SEARCH_QUERY_VARIABLES;

  if (groupId) {
    queryVariables.filter = { searchGroup: true };
  }

  // fetch the conversations from cache
  const { loading, error, data, client } = useQuery<any>(SEARCH_QUERY, {
    variables: queryVariables,
    fetchPolicy: 'cache-first',
  });

  useEffect(() => {
    if (getUserRole().includes('Staff')) {
      setSimulatorAccess(false);
    }
  }, []);

  if (loading) return <Loading />;
  if (error) {
    setErrorMessage(client, error);
    return null;
  }

  // TODOS: Need to redirect to first contact or first group based on the tab selection
  if (!contactId && !groupId && data.search.length !== 0) {
    // return <Redirect to={'/chat/'.concat(data.search[0].contact.id)} />;
  }

  let chatInterface: any;
  if (data && data.search.length === 0) {
    chatInterface = (
      <Typography variant="h5" className={styles.NoConversations}>
        There are no chat conversations to display.
      </Typography>
    );
  } else {
    if (contactId) {
      const simulatedContact = data.search.filter(
        (item: any) => item.contact.phone === SIMULATOR_CONTACT
      );
      if (simulatedContact.length > 0) {
        simulatorId = simulatedContact[0].contact.id;
      }
    }

    const handleTabClick = (tab: string) => {
      setSelectedTab(tab);
    };

    let listingContent;
    let contactSelectedClass = '';
    let groupSelectedClass = '';
    if (contactId && selectedTab === 'contacts') {
      listingContent = (
        <ChatConversations
          contactId={showSimulator && simulatorId ? Number(simulatorId) : contactId}
          simulator={{ simulatorId, setShowSimulator }}
        />
      );
      contactSelectedClass = `${styles.SelectedTab}`;
    } else if (groupId) {
      listingContent = <CollectionConversations groupId={groupId} />;
      groupSelectedClass = `${styles.SelectedTab}`;
    }

    chatInterface = (
      <>
        <div className={styles.ChatMessages}>
          <ChatMessages
            contactId={showSimulator && simulatorId ? simulatorId : contactId}
            simulatorId={simulatorId}
            groupId={groupId}
          />
        </div>

        <div className={styles.ChatConversations}>
          <Toolbar className={styles.ToolBar}>
            <div className={styles.IconBackground}>
              <img src={selectedChatIcon} height="24" className={styles.Icon} alt="Conversation" />
            </div>
            <div className={styles.TabContainer}>
              <div
                className={styles.Title}
                aria-hidden="true"
                onClick={() => handleTabClick('contacts')}
                onKeyDown={() => handleTabClick('contacts')}
              >
                <Typography className={`${styles.TitleText} ${contactSelectedClass}`} variant="h6">
                  Contacts
                </Typography>
              </div>
              <div
                className={styles.Title}
                aria-hidden="true"
                onClick={() => handleTabClick('groups')}
                onKeyDown={() => handleTabClick('groups')}
              >
                <Typography className={`${styles.TitleText} ${groupSelectedClass}`} variant="h6">
                  Groups
                </Typography>
              </div>
            </div>
          </Toolbar>

          <div>{listingContent}</div>
        </div>
      </>
    );
  }

  return (
    <Paper>
      <div className={styles.Chat} data-testid="chatContainer">
        {chatInterface}
      </div>
      {simulatorAccess && !groupId ? (
        <Simulator setShowSimulator={setShowSimulator} showSimulator={showSimulator} />
      ) : null}
    </Paper>
  );
};
