import { useLazyQuery, useQuery } from '@apollo/client';
import {
  DEFAULT_ENTITY_LIMIT,
  DEFAULT_MESSAGE_LIMIT,
  GROUP_COLLECTION_SEARCH_QUERY_VARIABLES,
  GROUP_QUERY_VARIABLES,
  REFETCH_RANDOM_TIME_MAX,
  REFETCH_RANDOM_TIME_MIN,
} from 'common/constants';
import { setErrorMessage } from 'common/notification';
import { randomIntFromInterval, addLogs } from 'common/utils';
import { GROUP_SEARCH_QUERY } from 'graphql/queries/WA_Groups';
import {
  WA_MESSAGE_RECEIVED_SUBSCRIPTION,
  WA_MESSAGE_SENT_SUBSCRIPTION,
} from 'graphql/subscriptions/Groups';
import { useCallback, useEffect, useState } from 'react';
import { getUserSession } from 'services/AuthService';
import { saveGroupConversation } from 'services/GroupMessageService';
import {
  getSubscriptionDetails,
  recordRequests,
  switchSubscriptionToRefetch,
} from 'services/SubscriptionService';

export interface GroupMessageProps {
  setDataLoaded: any;
}

export const GroupMessageSubscription = ({ setDataLoaded }: GroupMessageProps) => {
  const queryVariables = GROUP_QUERY_VARIABLES;
  let subscriptionToRefetchSwitchHappened = false;
  let refetchTimer: any = null;
  const groupsFetched: any = [];

  const [triggerRefetch, setTriggerRefetch] = useState(false);

  const [getGroupQuery] = useLazyQuery(GROUP_SEARCH_QUERY);

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

      let fetchMissingGroup = false;
      // let's record message sent and received subscriptions
      if (action === 'SENT' || action === 'RECEIVED') {
        // set fetch missing group flag
        fetchMissingGroup = true;

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

      const { newMessage, entityId, messageStatusData } = getSubscriptionDetails(
        action,
        subscriptionData,
        true
      );

      // loop through the cached conversations and find if group exists
      let conversationIndex = 0;
      let conversationFound = false;
      if (action === 'COLLECTION') {
        cachedConversations.search.forEach((conversation: any, index: any) => {
          if (conversation.group.id === entityId) {
            conversationIndex = index;
            conversationFound = true;
          }
        });
      } else {
        cachedConversations.search.forEach((conversation: any, index: any) => {
          if (parseInt(conversation.waGroup.id) === entityId) {
            conversationIndex = index;
            conversationFound = true;
          }
        });
      }
      // we should fetch missing group only when we receive message subscriptions
      // this means group is not cached, so we need to fetch the conversations and add
      // it to the cached conversations
      // let's also skip fetching group when we trigger this via group subscriptions
      // let's skip fetch group when we switch to refetch mode from subscription
      if (
        !conversationFound &&
        newMessage &&
        !newMessage.entityId &&
        fetchMissingGroup &&
        !triggerRefetch
      ) {
        const variables = {
          waMessageOpts: {
            limit: DEFAULT_MESSAGE_LIMIT,
          },
          waGroupOpts: {
            limit: DEFAULT_ENTITY_LIMIT,
          },
          filter: { id: entityId?.toString() },
        };

        addLogs(
          `${action}-group is not cached, so we need to fetch the conversations and add to cache`,
          variables
        );

        if (!groupsFetched.includes(entityId)) {
          groupsFetched.push(entityId);

          getGroupQuery({
            variables,
          }).then(({ data: conversation }) => {
            if (conversation && conversation.search.length > 0) {
              // save the conversation and update cache
              // temporary fix for cache. need to check why query variables change
              saveGroupConversation(conversation, queryVariables);
            }
          });
        }

        return cachedConversations;
      }

      // we need to handle 2 scenarios:
      // 1. Add new message if message is sent or received
      // let's start by parsing existing conversations
      const updatedConversations = JSON.parse(JSON.stringify(cachedConversations));
      let updatedConversation = updatedConversations.search;

      // get the conversation for the group that needs to be updated
      updatedConversation = updatedConversation.splice(conversationIndex, 1);

      // Add new message and move the conversation to the top
      if (newMessage) {
        updatedConversation[0].messages.unshift(newMessage);
      } else {
        updatedConversation[0].messages.forEach((message: any) => {
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
    [getGroupQuery]
  );

  const { loading, error, subscribeToMore, data, refetch } = useQuery<any>(GROUP_SEARCH_QUERY, {
    variables: queryVariables,
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-only',
  });

  const {} = useQuery<any>(GROUP_SEARCH_QUERY, {
    variables: GROUP_COLLECTION_SEARCH_QUERY_VARIABLES,
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-only',
  });

  useEffect(() => {
    if (subscribeToMore) {
      const subscriptionVariables = { organizationId: getUserSession('organizationId') };
      // message received subscription
      subscribeToMore({
        document: WA_MESSAGE_RECEIVED_SUBSCRIPTION,
        variables: subscriptionVariables,
        updateQuery: (prev, { subscriptionData }) =>
          updateConversations(prev, subscriptionData, 'RECEIVED'),
      });

      // message sent subscription
      subscribeToMore({
        document: WA_MESSAGE_SENT_SUBSCRIPTION,
        variables: subscriptionVariables,
        updateQuery: (prev, { subscriptionData }) =>
          updateConversations(prev, subscriptionData, 'SENT'),
      });
    }
  }, [subscribeToMore]);

  useEffect(() => {
    if (data) {
      setDataLoaded(true);
    }
  }, [data]);

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
