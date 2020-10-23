import React, { useEffect, useCallback, useState } from 'react';
import { Paper, Typography } from '@material-ui/core';
import { useQuery, useLazyQuery } from '@apollo/client';
import { Redirect } from 'react-router-dom';
import { Simulator } from '../../components/simulator/Simulator';
import ChatMessages from './ChatMessages/ChatMessages';
import ChatConversations from './ChatConversations/ChatConversations';
import Loading from '../../components/UI/Layout/Loading/Loading';
import styles from './Chat.module.css';
import { SEARCH_QUERY } from '../../graphql/queries/Search';
import {
  MESSAGE_RECEIVED_SUBSCRIPTION,
  MESSAGE_SENT_SUBSCRIPTION,
} from '../../graphql/subscriptions/Chat';
import {
  ADD_MESSAGE_TAG_SUBSCRIPTION,
  DELETE_MESSAGE_TAG_SUBSCRIPTION,
} from '../../graphql/subscriptions/Tag';
import { setErrorMessage } from '../../common/notification';
import { SEARCH_QUERY_VARIABLES } from '../../common/constants';
import { SIMULATOR_CONTACT } from '../../common/constants';
import { getUserSession } from '../../services/AuthService';
import { saveConverations } from '../../services/ChatService';

export interface ChatProps {
  contactId: number;
}

export const Chat: React.SFC<ChatProps> = ({ contactId }) => {
  // fetch the default conversations
  // default queryvariables
  const [showSimulator, setShowSimulator] = useState(false);
  let simulatorId: string | null = null;

  const queryVariables = SEARCH_QUERY_VARIABLES;

  const { loading, error, data, subscribeToMore, client } = useQuery<any>(SEARCH_QUERY, {
    variables: queryVariables,
  });

  const [getContactQuery] = useLazyQuery(SEARCH_QUERY, {
    onCompleted: (conversation) => {
      if (conversation) {
        // save the conversation and update cache
        saveConverations(conversation, client, queryVariables);
      }
    },
  });

  const updateConversations = useCallback(
    (cachedConversations: any, subscriptionData: any, action: string) => {
      // if there is no message data then return previous conversations

      if (!subscriptionData.data) {
        return cachedConversations;
      }

      // let's return early incase we don't have cached conversations
      // TODO: Need to investigate why this happens
      if (!cachedConversations) {
        return;
      }

      let newMessage: any;
      let contactId: number = 0;
      let tagData: any;
      switch (action) {
        case 'SENT':
          // set the receiver contact id
          newMessage = subscriptionData.data.sentMessage;
          contactId = subscriptionData.data.sentMessage.receiver.id;

          break;
        case 'RECEIVED':
          // set the sender contact id
          newMessage = subscriptionData.data.receivedMessage;
          contactId = subscriptionData.data.receivedMessage.sender.id;
          break;
        case 'TAG_ADDED':
        case 'TAG_DELETED':
          if (action === 'TAG_ADDED') {
            tagData = subscriptionData.data.createdMessageTag;
          } else {
            tagData = subscriptionData.data.deletedMessageTag;
          }

          if (tagData.message.flow === 'INBOUND') {
            // we should use sender id to update the tag
            contactId = tagData.message.sender.id;
          } else {
            // we should use receiver id to update the tag
            contactId = tagData.message.receiver.id;
          }
          break;
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

      // we need to handle 2 scenarios:
      // 1. Add new message if message is sent or received
      // 2. Add/Delete message tags for a message
      // let's start by parsing existing conversations
      const updatedConversations = JSON.parse(JSON.stringify(cachedConversations));
      let updatedConversation = updatedConversations.search;

      // get the conversation for the contact that needs to be updated
      updatedConversation = updatedConversation.splice(conversationIndex, 1);

      //update contact last message at when receiving a new Message
      if (action === 'RECEIVED') {
        updatedConversation[0].contact.lastMessageAt = newMessage.insertedAt;
      }

      // Add new message and move the conversation to the top
      if (newMessage) {
        updatedConversation[0].messages.unshift(newMessage);
      } else {
        // let's add/delete tags for the message
        // tag object: tagData.tag
        updatedConversation[0].messages.map((message: any) => {
          if (message.id === tagData.message.id) {
            // let's add tag if action === "TAG_ADDED"
            if (action === 'TAG_ADDED') {
              message.tags.push(tagData.tag);
            } else {
              // handle delete of selected tags
              message.tags = message.tags.filter((tag: any) => tag.id !== tagData.tag.id);
            }
          }
        });
      }

      // update the conversations
      updatedConversations.search = [...updatedConversation, ...updatedConversations.search];

      // return the updated object
      const returnConversations = Object.assign({}, cachedConversations, {
        ...updatedConversations,
      });

      return returnConversations;
    },
    [getContactQuery]
  );

  // handle subscription for message received and sent
  const getMessageResponse = useCallback(() => {
    // let's map all the subscriptions to logged in user's organization
    const subscriptionVariables = { organizationId: getUserSession('organizationId') };
    // message received subscription
    subscribeToMore({
      document: MESSAGE_RECEIVED_SUBSCRIPTION,
      variables: subscriptionVariables,
      updateQuery: (prev, { subscriptionData }) => {
        return updateConversations(prev, subscriptionData, 'RECEIVED');
      },
    });

    // message sent subscription
    subscribeToMore({
      document: MESSAGE_SENT_SUBSCRIPTION,
      variables: subscriptionVariables,
      updateQuery: (prev, { subscriptionData }) => {
        return updateConversations(prev, subscriptionData, 'SENT');
      },
    });

    // tag added subscription
    subscribeToMore({
      document: ADD_MESSAGE_TAG_SUBSCRIPTION,
      variables: subscriptionVariables,
      updateQuery: (prev, { subscriptionData }) => {
        return updateConversations(prev, subscriptionData, 'TAG_ADDED');
      },
    });

    // tag delete subscription
    subscribeToMore({
      document: DELETE_MESSAGE_TAG_SUBSCRIPTION,
      variables: subscriptionVariables,
      updateQuery: (prev, { subscriptionData }) => {
        return updateConversations(prev, subscriptionData, 'TAG_DELETED');
      },
    });
  }, [subscribeToMore, updateConversations]);

  useEffect(() => {
    getMessageResponse();
    // we should call useEffect only once hence []
  }, [getMessageResponse]);

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
      <Simulator setShowSimulator={setShowSimulator} showSimulator={showSimulator} />
    </Paper>
  );
};
