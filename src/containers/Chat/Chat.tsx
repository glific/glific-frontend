import React, { useEffect, useCallback } from 'react';
import { Paper } from '@material-ui/core';
import { useQuery, useApolloClient } from '@apollo/client';
import { Redirect } from 'react-router-dom';

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

  const updateConversations = useCallback(
    (cachedConversations: any, subscriptionData: any, action: string) => {
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
        //TODO: Need to fix this when new contact is received.
        console.log('Error: Conversation not found! ', conversationIndex);
        return cachedConversations;
      }

      // We need to add new message to existing messages array
      const updatedConversations = JSON.parse(JSON.stringify(cachedConversations));
      updatedConversations.conversations[conversationIndex].messages.unshift(newMessage);

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
        return updateConversations(prev, subscriptionData, 'RECEIVED');
      },
    });

    // message sent subscription
    subscribeToMore({
      document: MESSAGE_SENT_SUBSCRIPTION,
      variables: queryVariables,
      updateQuery: (prev, { subscriptionData }) => {
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

  // const getConversations = () => {
  //   const allConversations: any = client.readQuery({
  //     query: GET_CONVERSATION_QUERY,
  //     variables: queryVariables,
  //   });
  //   return allConversations;
  // };

  // let newContactId: number;
  // let allConversations = getConversations();
  // if (!contactId && allConversations.conversations.length !== 0) {
  //   return <Redirect to={'/chat/'.concat(allConversations.conversations[0].contact.id)} />;
  // } else {
  //   // Either don't have contactId or no conversations. Either or, this will be null, and ChatMessages will render a messaging saying 'No messages'.
  //   newContactId = contactId;
  // if (!contactId && data.conversations.length !== 0) {
  //   return <Redirect to={'/chat/'.concat(data.conversations[0].contact.id)} />;
  // }

  return (
    <Paper>
      <div className={styles.Chat}>
        <div className={styles.ChatMessages}>
          <ChatMessages
            contactId={newContactId}
            getConversations={getConversations}
            allConversations={allConversations}
          />
        </div>
        <div className={styles.ChatConversations}>
          <ChatConversations contactId={contactId} />
        </div>
      </div>
    </Paper>
  );
};

export default Chat;
