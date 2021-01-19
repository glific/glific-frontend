import React, { useCallback, useEffect } from 'react';
import { useApolloClient, useLazyQuery } from '@apollo/client';

import { SEARCH_QUERY_VARIABLES } from '../../../common/constants';
import { SEARCH_QUERY } from '../../../graphql/queries/Search';
import { saveConversation } from '../../../services/ChatService';
import { getUserSession } from '../../../services/AuthService';
import {
  GROUP_SENT_SUBSCRIPTION,
  MESSAGE_RECEIVED_SUBSCRIPTION,
  MESSAGE_SENT_SUBSCRIPTION,
} from '../../../graphql/subscriptions/Chat';
import {
  ADD_MESSAGE_TAG_SUBSCRIPTION,
  DELETE_MESSAGE_TAG_SUBSCRIPTION,
} from '../../../graphql/subscriptions/Tag';
import { Loading } from '../../../components/UI/Layout/Loading/Loading';
import { setErrorMessage } from '../../../common/notification';

export interface ChatSubscriptionProps {
  setDataLoaded: any;
  setLoading: any;
}

export const ChatSubscription: React.SFC<ChatSubscriptionProps> = ({
  setDataLoaded,
  setLoading,
}) => {
  const queryVariables = SEARCH_QUERY_VARIABLES;
  const client = useApolloClient();

  const [getContactQuery] = useLazyQuery(SEARCH_QUERY, {
    onCompleted: (conversation) => {
      if (conversation) {
        // save the conversation and update cache
        saveConversation(conversation, client, queryVariables);
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
        return null;
      }

      let newMessage: any;
      let contactId: number = 0;
      let groupId: number = 0;
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
        case 'GROUP':
          newMessage = subscriptionData.data.sentGroupMessage;
          groupId = subscriptionData.data.sentGroupMessage.groupId.toString();
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
        default:
          break;
      }

      // loop through the cached conversations and find if contact exists
      let conversationIndex = 0;
      let conversationFound = false;

      if (action === 'GROUP') {
        cachedConversations.search.map((conversation: any, index: any) => {
          if (conversation.group.id === groupId) {
            conversationIndex = index;
            conversationFound = true;
          }
          return null;
        });
      } else {
        cachedConversations.search.map((conversation: any, index: any) => {
          if (conversation.contact.id === contactId) {
            conversationIndex = index;
            conversationFound = true;
          }
          return null;
        });
      }

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

      // update contact last message at when receiving a new Message
      if (action === 'RECEIVED') {
        updatedConversation[0].contact.lastMessageAt = newMessage.insertedAt;
      }

      // Add new message and move the conversation to the top
      if (newMessage) {
        updatedConversation[0].messages.unshift(newMessage);
      } else {
        // let's add/delete tags for the message
        // tag object: tagData.tag
        updatedConversation[0].messages.forEach((message: any) => {
          if (message.id === tagData.message.id) {
            // let's add tag if action === "TAG_ADDED"
            if (action === 'TAG_ADDED') {
              message.tags.push(tagData.tag);
            } else {
              // handle delete of selected tags
              // disabling eslint compile error for this until we find better solution
              // eslint-disable-next-line
              message.tags = message.tags.filter((tag: any) => tag.id !== tagData.tag.id);
            }
          }
        });
      }

      // update the conversations
      updatedConversations.search = [...updatedConversation, ...updatedConversations.search];

      // return the updated object
      const returnConversations = { ...cachedConversations, ...updatedConversations };
      return returnConversations;
    },
    [getContactQuery]
  );

  const [loadGroupData, { subscribeToMore: groupSubscribe, data: groupData }] = useLazyQuery<any>(
    SEARCH_QUERY,
    {
      nextFetchPolicy: 'cache-only',
      onCompleted: () => {
        const subscriptionVariables = { organizationId: getUserSession('organizationId') };

        if (groupSubscribe) {
          // message received subscription
          groupSubscribe({
            document: GROUP_SENT_SUBSCRIPTION,
            variables: subscriptionVariables,
            updateQuery: (prev, { subscriptionData }) => {
              return updateConversations(prev, subscriptionData, 'GROUP');
            },
          });
        }
      },
    }
  );

  const [loadData, { loading, error, subscribeToMore, data }] = useLazyQuery<any>(SEARCH_QUERY, {
    variables: queryVariables,
    nextFetchPolicy: 'cache-only',
    onCompleted: () => {
      const subscriptionVariables = { organizationId: getUserSession('organizationId') };

      if (subscribeToMore) {
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
      }
    },
  });

  useEffect(() => {
    if (data && groupData) {
      setDataLoaded(true);
    }
  }, [data, groupData]);

  useEffect(() => {
    setLoading(loading);
  }, [loading]);

  useEffect(() => {
    if (!data) {
      const groupFilter = JSON.parse(JSON.stringify(queryVariables));
      groupFilter.filter.searchGroup = true;
      loadData();
      loadGroupData({ variables: groupFilter });
    }
  }, []);

  if (loading) return <Loading />;
  if (error) {
    setErrorMessage(client, error);
    return null;
  }

  return null;
};
