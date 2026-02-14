import { DEFAULT_ENTITY_LIMIT, DEFAULT_MESSAGE_LIMIT, REFETCH_RANDOM_TIME_MAX, REFETCH_RANDOM_TIME_MIN } from 'common/constants';
import { addLogs, randomIntFromInterval } from 'common/utils';
import { saveConversation } from 'services/ChatService';
import { getSubscriptionDetails, recordRequests, switchSubscriptionToRefetch } from 'services/SubscriptionService';

export const handleUpdateConversations = (
    cachedConversations: any,
    subscriptionData: any,
    action: string,
    context: {
        subscriptionToRefetchSwitchHappened: { current: boolean };
        refetchTimer: { current: any };
        setTriggerRefetch: (val: boolean) => void;
        getContactQuery: any;
        queryVariables: any;
        triggerRefetch: boolean;
        entityIdsFetched: { current: any[] };
    }
) => {
    const {
        subscriptionToRefetchSwitchHappened,
        refetchTimer,
        setTriggerRefetch,
        getContactQuery,
        queryVariables,
        triggerRefetch,
        entityIdsFetched,
    } = context;

    // if there is no message data then return previous conversations
    if (!subscriptionData.data || subscriptionToRefetchSwitchHappened.current) {
        return cachedConversations;
    }

    // let's return early incase we don't have cached conversations
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
        if (switchSubscriptionToRefetch() && !subscriptionToRefetchSwitchHappened.current) {
            // set the switch flag
            subscriptionToRefetchSwitchHappened.current = true;

            // let's get the random wait time
            const waitTime = randomIntFromInterval(REFETCH_RANDOM_TIME_MIN, REFETCH_RANDOM_TIME_MAX) * 1000;

            // let's clear the timeout if exists
            if (refetchTimer.current) {
                clearTimeout(refetchTimer.current);
            }

            refetchTimer.current = setTimeout(() => {
                // reset the switch flag
                subscriptionToRefetchSwitchHappened.current = false;

                // let's trigger refetch action
                setTriggerRefetch(true);
            }, waitTime);

            return cachedConversations;
        }
    }

    const { newMessage, entityId, collectionId, messageStatusData } = getSubscriptionDetails(action, subscriptionData);

    // loop through the cached conversations and find if contact exists
    if (!cachedConversations?.search) {
        return cachedConversations;
    }

    let conversationIndex = 0;
    let conversationFound = false;

    if (action === 'COLLECTION') {
        cachedConversations.search.forEach((conversation: any, index: any) => {
            if (conversation.group?.id === collectionId) {
                conversationIndex = index;
                conversationFound = true;
            }
        });
    } else {
        cachedConversations.search.forEach((conversation: any, index: any) => {
            if (conversation.contact?.id === entityId) {
                conversationIndex = index;
                conversationFound = true;
            }
        });
    }

    // we should fetch missing contact only when we receive message subscriptions
    if (!conversationFound && newMessage && !newMessage.groupId && fetchMissingContact && !triggerRefetch) {
        const variables = {
            contactOpts: {
                limit: DEFAULT_ENTITY_LIMIT,
            },
            filter: { id: entityId },
            messageOpts: {
                limit: DEFAULT_MESSAGE_LIMIT,
            },
        };

        addLogs(`${action}-contact is not cached, so we need to fetch the conversations and add to cache`, variables);

        if (!entityIdsFetched.current.includes(entityId)) {
            entityIdsFetched.current.push(entityId);

            getContactQuery({
                variables,
            }).then(({ data: conversation }: any) => {
                if (conversation && conversation.search.length > 0) {
                    // save the conversation and update cache
                    saveConversation(conversation, queryVariables);
                }
            });
        }

        return cachedConversations;
    }

    if (!conversationFound) {
        return cachedConversations;
    }

    // we need to handle 2 scenarios:
    // 1. Add new message if message is sent or received
    const updatedConversations = JSON.parse(JSON.stringify(cachedConversations));
    let updatedConversation = updatedConversations.search;

    // get the conversation for the contact that needs to be updated
    updatedConversation = updatedConversation.splice(conversationIndex, 1);

    if (updatedConversation.length === 0) {
        return cachedConversations;
    }

    // update contact last message at when receiving a new Message
    if (action === 'RECEIVED' && updatedConversation[0].contact) {
        updatedConversation[0].contact.lastMessageAt = newMessage.insertedAt;
        updatedConversation[0].contact.bspStatus = newMessage.contact.bspStatus;
    }

    // Add new message and move the conversation to the top
    if (newMessage) {
        updatedConversation[0].messages.unshift(newMessage);
    } else {
        updatedConversation[0].messages.forEach((message: any) => {
            if (messageStatusData && message.id === messageStatusData.id) {
                message.errors = messageStatusData.errors;
            }
        });
    }

    // update the conversations
    updatedConversations.search = [...updatedConversation, ...updatedConversations.search];

    // return the updated object
    return { ...cachedConversations, ...updatedConversations };
};
