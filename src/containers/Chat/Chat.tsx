import React, { useEffect, useCallback } from 'react';
import { Paper } from '@material-ui/core';
import { useQuery } from '@apollo/client';

import ChatMessages from './ChatMessages/ChatMessages';
import ChatConversations from './ChatConversations/ChatConversations';
import Loading from '../../components/UI/Layout/Loading/Loading';
import styles from './Chat.module.css';

import { GET_CONVERSATION_QUERY } from '../../graphql/queries/Chat';
import {
  MESSAGE_RECEIVED_SUBSCRIPTION,
  MESSAGE_SENT_SUBSCRIPTION,
} from '../../graphql/subscriptions/Chat';

export interface ChatProps {
  contactId: number;
}

const Chat: React.SFC<ChatProps> = ({ contactId }) => {
  // fetch the default conversations
  // default queryvariables
  const queryVariables = {
    contactOpts: {
      limit: 50,
    },
    filter: {},
    messageOpts: {
      limit: 100,
    },
  };

  const { loading, error, data, subscribeToMore } = useQuery<any>(GET_CONVERSATION_QUERY, {
    variables: queryVariables,
  });

  const updateConversations = useCallback(
    (cachedConversations: any, subscriptionData: any, action: string) => {
      //TODO: cachedConversations is empty sometimes, so just return, come back and investigate later
      if (!cachedConversations) {
        return;
      }

      // if there is no message data then return previous conversations
      if (!subscriptionData.data) {
        return cachedConversations;
      }

      let newMessage: any;
      let contactId: number;
      if (action === 'SENT') {
        // set the receiver contact id
        newMessage = subscriptionData.data.sentMessage;
        contactId = subscriptionData.data.sentMessage.receiver.id;
      } else {
        // set the sender contact id
        newMessage = subscriptionData.data.receivedMessage;
        contactId = subscriptionData.data.receivedMessage.sender.id;
      }

      //loop through the cached conversations and find if contact exists
      let conversationIndex = 0;
      let conversationFound = false;
      cachedConversations.conversations.map((conversation: any, index: any) => {
        if (conversation.contact.id === contactId) {
          conversationIndex = index;
          conversationFound = true;
        }
        return null;
      });

      // this means contact is not cached, so we need to fetch the conversations and add
      // it to the cached conversations
      if (!conversationFound) {
        //TODO
        console.log('Error: Conversation not found! ', conversationIndex);
      }

      // We need to add new message to existing messages array
      const updatedConversations = JSON.parse(JSON.stringify(cachedConversations));
      updatedConversations.conversations[conversationIndex].messages.push(newMessage);

      // return the updated object
      const returnConversations = Object.assign({}, cachedConversations, {
        ...updatedConversations,
      });

      return returnConversations;
    },
    []
  );

  // handle subscription for message received and sent
  const getMessageResponse = useCallback(() => {
    // message received subscription
    subscribeToMore({
      document: MESSAGE_RECEIVED_SUBSCRIPTION,
      variables: queryVariables,
      updateQuery: (prev, { subscriptionData }) => {
        console.log('calling message received sub');
        return updateConversations(prev, subscriptionData, 'RECEIVED');
      },
    });

    // message sent subscription
    subscribeToMore({
      document: MESSAGE_SENT_SUBSCRIPTION,
      variables: queryVariables,
      updateQuery: (prev, { subscriptionData }) => {
        console.log('calling message sent sub');
        return updateConversations(prev, subscriptionData, 'SENT');
      },
    });
  }, [subscribeToMore, queryVariables, updateConversations]);

  useEffect(() => {
    getMessageResponse();
    // we should call useEffect only once hence []
  }, []);

  if (loading) return <Loading />;
  if (error) return <p>Error :(</p>;

  if (data === undefined || data.conversations === undefined) {
    return null;
  }

  return (
    <Paper>
      <div className={styles.Chat}>
        <div className={styles.ChatMessages}>
          <ChatMessages contactId={contactId} />
        </div>
        <div className={styles.ChatConversations}>
          <ChatConversations />
        </div>
      </div>
    </Paper>
  );
};

export default Chat;
