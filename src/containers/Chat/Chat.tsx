import React, { useState, useEffect } from 'react';
import { Paper, Typography } from '@material-ui/core';
import { useQuery } from '@apollo/client';
import { Redirect } from 'react-router-dom';
import { Simulator } from '../../components/simulator/Simulator';
import ChatMessages from './ChatMessages/ChatMessages';
import ChatConversations from './ChatConversations/ChatConversations';
import Loading from '../../components/UI/Layout/Loading/Loading';
import styles from './Chat.module.css';
import { SEARCH_QUERY } from '../../graphql/queries/Search';

import { setErrorMessage } from '../../common/notification';
import { SEARCH_QUERY_VARIABLES } from '../../common/constants';
import { SIMULATOR_CONTACT } from '../../common/constants';
import { getUserRole } from '../../context/role';

export interface ChatProps {
  contactId: number;
}

export const Chat: React.SFC<ChatProps> = ({ contactId }) => {
  const [simulatorAccess, setSimulatorAccess] = useState(true);
  const [showSimulator, setShowSimulator] = useState(false);
  let simulatorId: string | null = null;

  // default queryvariables
  const queryVariables = SEARCH_QUERY_VARIABLES;

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

  if (!contactId && data.search.length !== 0) {
    return <Redirect to={'/chat/'.concat(data.search[0].contact.id)} />;
  }

  let chatInterface: any;
  if (data && data.search.length === 0) {
    chatInterface = (
      <Typography variant="h5" className={styles.NoConversations}>
        There are no chat conversations to display.
      </Typography>
    );
  } else {
    const simulatedContact = data.search.filter(
      (item: any) => item.contact.phone === SIMULATOR_CONTACT
    );
    if (simulatedContact.length > 0) {
      simulatorId = simulatedContact[0].contact.id;
    }
    chatInterface = (
      <>
        <div className={styles.ChatMessages}>
          <ChatMessages contactId={showSimulator && simulatorId ? simulatorId : contactId} />
        </div>
        <div className={styles.ChatConversations}>
          <ChatConversations
            contactId={showSimulator && simulatorId ? parseInt(simulatorId) : contactId}
            simulator={{ simulatorId, setShowSimulator }}
          />
        </div>
      </>
    );
  }

  return (
    <Paper>
      <div className={styles.Chat}>{chatInterface}</div>
      {simulatorAccess ? (
        <Simulator setShowSimulator={setShowSimulator} showSimulator={showSimulator} />
      ) : null}
    </Paper>
  );
};
