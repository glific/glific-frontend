import React, { useEffect, useCallback } from 'react';
import { Paper } from '@material-ui/core';
import { useQuery, useApolloClient } from '@apollo/client';

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
  // create an instance of apolloclient
  const client = useApolloClient();

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

  // handle subscription for message received and sent
  const getMessageResponse = useCallback(() => {
    // message received subscription
    subscribeToMore({
      document: MESSAGE_RECEIVED_SUBSCRIPTION,
      variables: queryVariables,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const newMessage = subscriptionData.data.receivedMessage;
        const senderId = subscriptionData.data.receivedMessage.sender.id;

        //loop through the cached conversations and find if contact exists
        let conversationIndex;
        prev.conversations.map((conversation: any, index: any) => {
          if (conversation.contact.id === senderId) {
            conversationIndex = index;
          }
        });

        // this means contact is not cached, so we need to fetch the conversations and add
        // it to the cached conversations
        if (!conversationIndex) {
          //TODO
        }

        if (conversationIndex) {
          const messagesCopy = JSON.parse(JSON.stringify(prev));
          messagesCopy.conversations[conversationIndex].messages.push(newMessage);

          return Object.assign({}, prev, {
            conversations: messagesCopy,
          });
        }
      },
    });

    // message sent subscription
    subscribeToMore({
      document: MESSAGE_SENT_SUBSCRIPTION,
      variables: queryVariables,
      updateQuery: (prev, { subscriptionData }) => {
        // TODO: this is called twice and second time prev is empty, need to fix
        if (!prev) return;
        if (!subscriptionData.data) return prev;
        const newMessage = subscriptionData.data.sentMessage;
        const receiverId = subscriptionData.data.sentMessage.receiver.id;

        //loop through the cached conversations and find if contact exists
        let conversationIndex;
        prev.conversations.map((conversation: any, index: any) => {
          if (conversation.contact.id === receiverId) {
            conversationIndex = index;
          }
        });

        // this means contact is not cached, so we need to fetch the conversations and add
        // it to the cached conversations
        if (!conversationIndex) {
          //TODO
        }

        if (conversationIndex) {
          const messagesCopy = JSON.parse(JSON.stringify(prev));
          messagesCopy.conversations[conversationIndex].messages.push(newMessage);

          return Object.assign({}, prev, {
            conversations: messagesCopy,
          });
        }
      },
    });
  }, [subscribeToMore, queryVariables, contactId]);

  useEffect(() => {
    getMessageResponse();
  }, [getMessageResponse]);

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
