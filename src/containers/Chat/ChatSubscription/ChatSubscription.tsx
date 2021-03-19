import React, { useCallback, useEffect, useState } from 'react';
import { useApolloClient, useLazyQuery } from '@apollo/client';

import {
  COLLECTION_SEARCH_QUERY_VARIABLES,
  DEFAULT_CONTACT_LIMIT,
  DEFAULT_MESSAGE_LIMIT,
  REFETCH_WAIT_TIME,
  SEARCH_QUERY_VARIABLES,
  SUBSCRIPTION_ALLOWED_DURATION,
  SUBSCRIPTION_ALLOWED_NUMBER,
} from '../../../common/constants';
import { SEARCH_QUERY } from '../../../graphql/queries/Search';
import { saveConversation } from '../../../services/ChatService';
import { getUserSession } from '../../../services/AuthService';
import {
  COLLECTION_SENT_SUBSCRIPTION,
  MESSAGE_RECEIVED_SUBSCRIPTION,
  MESSAGE_SENT_SUBSCRIPTION,
  MESSAGE_STATUS_SUBSCRIPTION,
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
  let subscriptionRequests: any = [];
  let refetchTimer: any = null;
  const [triggerRefetch, setTriggerRefetch] = useState(false);

  const [getContactQuery] = useLazyQuery(SEARCH_QUERY, {
    onCompleted: (conversation) => {
      if (conversation && conversation.search.length > 0) {
        // save the conversation and update cache

        // temporary fix for cache. need to check why query variables change
        saveConversation(conversation, client, queryVariables);
      }
    },
  });

  // function to determine if we should continue to use subscription or use refetch
  const switchSubscriptionToRefetch = () => {
    let useRefetch = false;

    const now = Date.now();
    const allowedDuration = now - 1000 * SUBSCRIPTION_ALLOWED_DURATION;
    let requestCount = 0;

    // as recent requests are at the end of the array, search the array
    // from back to front
    for (let i = subscriptionRequests.length - 1; i >= 0; i -= 1) {
      if (subscriptionRequests[i] >= allowedDuration) {
        requestCount += 1;
      } else {
        break;
      }
    }

    if (requestCount >= SUBSCRIPTION_ALLOWED_NUMBER) {
      useRefetch = true;
    }

    return useRefetch;
  };

  // function to record the number of subscription calls
  const recordRequests = () => {
    const requestTrimThreshold = 5000;
    const requestTrimSize = 4000;

    subscriptionRequests.push(Date.now());

    // now keep requests array from growing forever
    if (subscriptionRequests.length > requestTrimThreshold) {
      subscriptionRequests = subscriptionRequests.slice(
        0,
        subscriptionRequests.length - requestTrimSize
      );
    }
  };

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

      // let's record message sent and received subscriptions
      if (action === 'SENT' || action === 'RECEIVED') {
        // build the request array
        recordRequests();

        // determine if we should use subscriptions or refetch the query
        if (switchSubscriptionToRefetch()) {
          // let's refetch and return
          const waitTime = REFETCH_WAIT_TIME * 1000;

          // let's clear the timeout to prevent multiple fetch calls
          if (refetchTimer) {
            clearTimeout(refetchTimer);
          }

          refetchTimer = setTimeout(() => {
            // let's call refetch once all subscriptions are done
            setTriggerRefetch(true);
          }, waitTime);

          return cachedConversations;
        }
      }

      let newMessage: any;
      let contactId: number = 0;
      let collectionId: number = 0;
      let tagData: any;
      let messageStatusData: any;
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
        case 'COLLECTION':
          newMessage = subscriptionData.data.sentGroupMessage;
          collectionId = subscriptionData.data.sentGroupMessage.groupId.toString();
          break;
        case 'STATUS':
          // set the receiver contact id
          messageStatusData = subscriptionData.data.updateMessageStatus;
          contactId = subscriptionData.data.updateMessageStatus.receiver.id;
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

      if (action === 'COLLECTION') {
        cachedConversations.search.map((conversation: any, index: any) => {
          if (conversation.group.id === collectionId) {
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
      console.log(action, newMessage);
      // this means contact is not cached, so we need to fetch the conversations and add
      // it to the cached conversations
      // let's also skip fetching contact when we trigger this via group subscriptions
      if (!conversationFound && newMessage && !newMessage.groupId) {
        getContactQuery({
          variables: {
            contactOpts: {
              limit: DEFAULT_CONTACT_LIMIT,
            },
            filter: { id: contactId },
            messageOpts: {
              limit: DEFAULT_MESSAGE_LIMIT,
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
          if (tagData && message.id === tagData.message.id) {
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

          if (messageStatusData && message.id === messageStatusData.id) {
            // eslint-disable-next-line
            message.errors = messageStatusData.errors;
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

  const [
    loadCollectionData,
    { subscribeToMore: collectionSubscribe, data: collectionData },
  ] = useLazyQuery<any>(SEARCH_QUERY, {
    variables: COLLECTION_SEARCH_QUERY_VARIABLES,
    nextFetchPolicy: 'cache-only',
    onCompleted: () => {
      const subscriptionVariables = { organizationId: getUserSession('organizationId') };

      if (collectionSubscribe) {
        // collection sent subscription
        collectionSubscribe({
          document: COLLECTION_SENT_SUBSCRIPTION,
          variables: subscriptionVariables,
          updateQuery: (prev, { subscriptionData }) =>
            updateConversations(prev, subscriptionData, 'COLLECTION'),
        });
      }
    },
  });

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
          updateQuery: (prev, { subscriptionData }) =>
            updateConversations(prev, subscriptionData, 'RECEIVED'),
        });

        // message sent subscription
        subscribeToMore({
          document: MESSAGE_SENT_SUBSCRIPTION,
          variables: subscriptionVariables,
          updateQuery: (prev, { subscriptionData }) =>
            updateConversations(prev, subscriptionData, 'SENT'),
        });

        // message status subscription
        subscribeToMore({
          document: MESSAGE_STATUS_SUBSCRIPTION,
          variables: subscriptionVariables,
          updateQuery: (prev, { subscriptionData }) =>
            updateConversations(prev, subscriptionData, 'STATUS'),
          onError: (e) => {
            console.log('e', e);
          },
        });

        // tag added subscription
        subscribeToMore({
          document: ADD_MESSAGE_TAG_SUBSCRIPTION,
          variables: subscriptionVariables,
          updateQuery: (prev, { subscriptionData }) =>
            updateConversations(prev, subscriptionData, 'TAG_ADDED'),
        });

        // tag delete subscription
        subscribeToMore({
          document: DELETE_MESSAGE_TAG_SUBSCRIPTION,
          variables: subscriptionVariables,
          updateQuery: (prev, { subscriptionData }) =>
            updateConversations(prev, subscriptionData, 'TAG_DELETED'),
        });
      }
    },
  });

  // let's fetch fresh data and update the cache
  const [fetchData] = useLazyQuery<any>(SEARCH_QUERY, {
    variables: queryVariables,
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    if (data && collectionData) {
      setDataLoaded(true);
    }
  }, [data, collectionData]);

  useEffect(() => {
    setLoading(loading);
  }, [loading]);

  useEffect(() => {
    if (!data) {
      loadData();
      loadCollectionData();
    }
  }, []);

  if (loading) return <Loading />;
  if (error) {
    setErrorMessage(client, error);
    return null;
  }

  if (triggerRefetch) {
    fetchData();
    setTriggerRefetch(false);
  }

  return null;
};
