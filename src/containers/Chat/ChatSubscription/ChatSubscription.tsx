import { useCallback, useEffect, useState, useRef } from 'react';
import { useLazyQuery, useQuery } from '@apollo/client';

import {
  COLLECTION_SEARCH_QUERY_VARIABLES,
  SEARCH_QUERY_VARIABLES,
} from 'common/constants';
import { setErrorMessage } from 'common/notification';
import { handleSubscriptionError, addLogs } from 'common/utils';
import { getUserSession } from 'services/AuthService';
import { SEARCH_QUERY } from 'graphql/queries/Search';
import {
  COLLECTION_SENT_SUBSCRIPTION,
  MESSAGE_RECEIVED_SUBSCRIPTION,
  MESSAGE_SENT_SUBSCRIPTION,
  MESSAGE_STATUS_SUBSCRIPTION,
} from 'graphql/subscriptions/Chat';
import { handleUpdateConversations } from './ChatSubscriptionUtils';

export interface ChatSubscriptionProps {
  setDataLoaded: any;
}

export const ChatSubscription = ({ setDataLoaded }: ChatSubscriptionProps) => {
  const queryVariables = SEARCH_QUERY_VARIABLES;
  const entityIdsFetched = useRef<any[]>([]);

  const refetchTimer = useRef<any>(null);
  const [triggerRefetch, setTriggerRefetch] = useState(false);
  const subscriptionToRefetchSwitchHappened = useRef(false);

  const [getContactQuery] = useLazyQuery(SEARCH_QUERY);

  const updateConversations = useCallback(
    (cachedConversations: any, subscriptionData: any, action: string) =>
      handleUpdateConversations(cachedConversations, subscriptionData, action, {
        subscriptionToRefetchSwitchHappened,
        refetchTimer,
        setTriggerRefetch,
        getContactQuery,
        queryVariables,
        triggerRefetch,
        entityIdsFetched,
      }),
    [getContactQuery, queryVariables, triggerRefetch]
  );

  const { subscribeToMore: collectionSubscribe, data: collectionData } = useQuery<any>(SEARCH_QUERY, {
    variables: COLLECTION_SEARCH_QUERY_VARIABLES,
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-only',
  });

  const { loading, error, subscribeToMore, data, refetch } = useQuery<any>(SEARCH_QUERY, {
    variables: queryVariables,
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-only',
  });

  useEffect(() => {
    if (collectionSubscribe) {
      const subscriptionVariables = { organizationId: getUserSession('organizationId') };
      // collection sent subscription
      collectionSubscribe({
        document: COLLECTION_SENT_SUBSCRIPTION,
        variables: subscriptionVariables,
        updateQuery: (prev, { subscriptionData }) => updateConversations(prev, subscriptionData, 'COLLECTION'),
        onError: (error) => handleSubscriptionError(error, 'COLLECTION', setTriggerRefetch),
      });
    }
  }, [collectionSubscribe]);

  useEffect(() => {
    if (subscribeToMore) {
      const subscriptionVariables = { organizationId: getUserSession('organizationId') };
      // message received subscription
      subscribeToMore({
        document: MESSAGE_RECEIVED_SUBSCRIPTION,
        variables: subscriptionVariables,
        updateQuery: (prev, { subscriptionData }) => updateConversations(prev, subscriptionData, 'RECEIVED'),
        onError: (error) => handleSubscriptionError(error, 'MESSAGE_RECEIVED', setTriggerRefetch),
      });

      // message sent subscription
      subscribeToMore({
        document: MESSAGE_SENT_SUBSCRIPTION,
        variables: subscriptionVariables,
        updateQuery: (prev, { subscriptionData }) => updateConversations(prev, subscriptionData, 'SENT'),
        onError: (error) => handleSubscriptionError(error, 'SENT', setTriggerRefetch),
      });

      // message status subscription
      subscribeToMore({
        document: MESSAGE_STATUS_SUBSCRIPTION,
        variables: subscriptionVariables,
        updateQuery: (prev, { subscriptionData }) => updateConversations(prev, subscriptionData, 'STATUS'),
        onError: (error) => handleSubscriptionError(error, 'STATUS', setTriggerRefetch),
      });
    }
  }, [subscribeToMore]);

  useEffect(() => {
    if (data && collectionData) {
      setDataLoaded(true);
    }
  }, [data, collectionData]);

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
