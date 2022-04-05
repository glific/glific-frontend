import React, { useCallback, useEffect, useState } from 'react';
import { useLazyQuery } from '@apollo/client';

import {
  COLLECTION_SEARCH_QUERY_VARIABLES,
  DEFAULT_CONTACT_LIMIT,
  DEFAULT_MESSAGE_LIMIT,
  REFETCH_RANDOM_TIME_MAX,
  REFETCH_RANDOM_TIME_MIN,
  SEARCH_QUERY_VARIABLES,
} from 'common/constants';
import { setErrorMessage } from 'common/notification';
import { randomIntFromInterval, addLogs } from 'common/utils';
import { saveConversation } from 'services/ChatService';
import { getUserSession } from 'services/AuthService';
import { SEARCH_QUERY } from 'graphql/queries/Search';
import {
  COLLECTION_SENT_SUBSCRIPTION,
  MESSAGE_RECEIVED_SUBSCRIPTION,
  MESSAGE_SENT_SUBSCRIPTION,
  MESSAGE_STATUS_SUBSCRIPTION,
} from 'graphql/subscriptions/Chat';
import {
  ADD_MESSAGE_TAG_SUBSCRIPTION,
  DELETE_MESSAGE_TAG_SUBSCRIPTION,
} from 'graphql/subscriptions/Tag';
import {
  getSubscriptionDetails,
  recordRequests,
  switchSubscriptionToRefetch,
} from 'services/SubscriptionService';

export interface ChatSubscriptionProps {
  setDataLoaded: any;
}

export const ChatSubscription: React.SFC<ChatSubscriptionProps> = ({ setDataLoaded }) => {
  const queryVariables = SEARCH_QUERY_VARIABLES;

  let refetchTimer: any = null;
  const [triggerRefetch, setTriggerRefetch] = useState(false);
  let subscriptionToRefetchSwitchHappened = false;

  const [getContactQuery] = useLazyQuery(SEARCH_QUERY);
  const onGetContactQuery = (conversation: any) => {
    if (conversation && conversation.search.length > 0) {
      // save the conversation and update cache

      // temporary fix for cache. need to check why query variables change
      saveConversation(conversation, queryVariables);
    }
  };

  const updateConversations = useCallback(
    (cachedConversations: any, subscriptionData: any, action: string) => {
      // if there is no message data then return previous conversations
      if (!subscriptionData.data || subscriptionToRefetchSwitchHappened) {
        return cachedConversations;
      }

      // let's return early incase we don't have cached conversations
      // TODO: Need to investigate why this happens
      if (!cachedConversations) {
        return null;
      }

      let fetchMissingContact = false;
      // let's record message sent and received subscriptions
      if (action === 'SENT' || action === 'RECEIVED') {
        // set fetch missing contact flag
        fetchMissingContact = true;

        // build the request array
        recordRequests();

        // determine if we should use subscriptions or refetch the query
        if (switchSubscriptionToRefetch() && !subscriptionToRefetchSwitchHappened) {
          // when switch happens
          // 1. get the random time as defined in constant
          // 2. set the refetch action for that duration
          // 3. if we are still in fetch mode repeat the same.

          // set the switch flag
          subscriptionToRefetchSwitchHappened = true;

          // let's get the random wait time
          const waitTime =
            randomIntFromInterval(REFETCH_RANDOM_TIME_MIN, REFETCH_RANDOM_TIME_MAX) * 1000;

          // let's clear the timeout if exists
          if (refetchTimer) {
            clearTimeout(refetchTimer);
          }

          refetchTimer = setTimeout(() => {
            // reset the switch flag
            subscriptionToRefetchSwitchHappened = false;

            // let's trigger refetch action
            setTriggerRefetch(true);
          }, waitTime);

          return cachedConversations;
        }
      }

      const { newMessage, contactId, collectionId, tagData, messageStatusData } =
        getSubscriptionDetails(action, subscriptionData);

      // loop through the cached conversations and find if contact exists
      let conversationIndex = 0;
      let conversationFound = false;

      if (action === 'COLLECTION') {
        cachedConversations.search.forEach((conversation: any, index: any) => {
          if (conversation.group.id === collectionId) {
            conversationIndex = index;
            conversationFound = true;
          }
        });
      } else {
        cachedConversations.search.forEach((conversation: any, index: any) => {
          if (conversation.contact.id === contactId) {
            conversationIndex = index;
            conversationFound = true;
          }
        });
      }

      // we should fetch missing contact only when we receive message subscriptions
      // this means contact is not cached, so we need to fetch the conversations and add
      // it to the cached conversations
      // let's also skip fetching contact when we trigger this via group subscriptions
      // let's skip fetch contact when we switch to refetch mode from subscription
      if (
        !conversationFound &&
        newMessage &&
        !newMessage.groupId &&
        fetchMissingContact &&
        !triggerRefetch
      ) {
        const variables = {
          contactOpts: {
            limit: DEFAULT_CONTACT_LIMIT,
          },
          filter: { id: contactId },
          messageOpts: {
            limit: DEFAULT_MESSAGE_LIMIT,
          },
        };

        addLogs(
          `${action}-contact is not cached, so we need to fetch the conversations and add to cache`,
          variables
        );

        getContactQuery({
          variables,
        }).then(({ data }) => {
          onGetContactQuery(data);
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

  const [loadCollectionData, { subscribeToMore: collectionSubscribe, data: collectionData }] =
    useLazyQuery<any>(SEARCH_QUERY, {
      variables: COLLECTION_SEARCH_QUERY_VARIABLES,
      fetchPolicy: 'network-only',
      nextFetchPolicy: 'cache-only',
    });

  const onLoadCollectionData = () => {
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
  };

  const [loadData, { loading, error, subscribeToMore, data, refetch }] = useLazyQuery<any>(
    SEARCH_QUERY,
    {
      variables: queryVariables,
      fetchPolicy: 'network-only',
      nextFetchPolicy: 'cache-only',
    }
  );

  useEffect(() => {
    if (data && collectionData) {
      setDataLoaded(true);
    }
  }, [data, collectionData]);

  useEffect(() => {
    if (!data) {
      loadData().then(() => {
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
            onError: () => {},
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
      });
      loadCollectionData().then(() => {
        onLoadCollectionData();
      });
    }
  }, []);

  // lets return empty if we are still loading
  if (loading) return <div />;

  if (error) {
    setErrorMessage(error);
    return null;
  }

  if (triggerRefetch) {
    // lets refetch here
    if (refetch) {
      addLogs('refetch for subscription', queryVariables);
      refetch();
    }
    setTriggerRefetch(false);
  }

  return null;
};

export default ChatSubscription;
