import React, { useEffect, useCallback } from 'react';
import { Paper, Typography } from '@material-ui/core';
import { useQuery, useLazyQuery } from '@apollo/client';
import { Redirect } from 'react-router-dom';
import ChatMessages from './ChatMessages/ChatMessages';
import ChatConversations from './ChatConversations/ChatConversations';
import Loading from '../../components/UI/Layout/Loading/Loading';
import styles from './Chat.module.css';
import { SEARCH_QUERY } from '../../graphql/queries/Search';
import {
  MESSAGE_RECEIVED_SUBSCRIPTION,
  MESSAGE_SENT_SUBSCRIPTION,
} from '../../graphql/subscriptions/Chat';
import { setErrorMessage } from '../../common/notification';

export interface ChatProps {
  contactId: number;
}

export const Chat: React.SFC<ChatProps> = ({ contactId }) => {
  // fetch the default conversations
  // default queryvariables

  const queryVariables = {
    contactOpts: {
      limit: 50,
    },
    filter: {},
    messageOpts: {
      limit: 50,
    },
  };

  const { loading, error, data, subscribeToMore, client } = useQuery<any>(SEARCH_QUERY, {
    variables: queryVariables,
  });

  const [getContactQuery] = useLazyQuery(SEARCH_QUERY, {
    onCompleted: (conversation) => {
      if (conversation) {
        const conversations = client.readQuery({
          query: SEARCH_QUERY,
          variables: queryVariables,
        });

        const conversationCopy = JSON.parse(JSON.stringify(conversation));
        conversationCopy.search[0].messages
          .sort((currentMessage: any, nextMessage: any) => {
            return currentMessage.id - nextMessage.id;
          })
          .reverse();

        const conversationsCopy = JSON.parse(JSON.stringify(conversations));
        conversationsCopy.search.unshift(conversationCopy.search[0]);
        client.writeQuery({
          query: SEARCH_QUERY,
          variables: queryVariables,
          data: conversationsCopy,
        });
      }
    },
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
      cachedConversations.search.map((conversation: any, index: any) => {
        if (conversation.contact.id === contactId) {
          conversationIndex = index;
          conversationFound = true;
        }
        return null;
      });

      // this means contact is not cached, so we need to fetch the conversations and add
      // it to the cached conversations
      if (!conversationFound) {
        getContactQuery({
          variables: {
            contactOpts: {
              limit: 50,
            },
            filter: { id: contactId },
            messageOpts: {
              limit: 50,
            },
          },
        });

        return cachedConversations;
      }

      // We need to add new message to existing messages array and moving conversation to the top
      const updatedConversations = JSON.parse(JSON.stringify(cachedConversations));
      let updatedConversation = updatedConversations.search;
      updatedConversation = updatedConversation.splice(conversationIndex, 1);
      updatedConversation[0].messages.unshift(newMessage);
      updatedConversations.search = [...updatedConversation, ...updatedConversations.search];

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
  if (error) {
    setErrorMessage(client, error);
    return null;
  }

  if (!contactId && data.search.length !== 0) {
    return <Redirect to={'/chat/'.concat(data.search[0].contact.id)} />;
  }

  let chatInterface: any;
  if (data.search.length === 0) {
    chatInterface = (
      <Typography variant="h5" className={styles.NoConversations}>
        There are no chat conversations to display.
      </Typography>
    );
  } else {
    chatInterface = (
      <>
        <div className={styles.ChatMessages}>
          <ChatMessages contactId={contactId} />
        </div>
        <div className={styles.ChatConversations}>
          <ChatConversations contactId={contactId} />
        </div>
      </>
    );
  }

  return (
    <Paper>
      <div className={styles.Chat}>{chatInterface}</div>
    </Paper>
  );
};
