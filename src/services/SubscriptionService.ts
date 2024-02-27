import { SUBSCRIPTION_ALLOWED_DURATION, SUBSCRIPTION_ALLOWED_NUMBER } from 'common/constants';
import { boolean } from 'yup';

let subscriptionRequests: any = [];

// function to determine if we should continue to use subscription or use refetch
export const switchSubscriptionToRefetch = () => {
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
export const recordRequests = () => {
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

export const getSubscriptionDetails = (action: string, subscriptionData: any, groups?: boolean) => {
  let newMessage: any;
  let contactId: number = 0;
  let collectionId: number = 0;
  let messageStatusData: any;

  switch (action) {
    case 'SENT':
      // set the receiver contact id
      newMessage = groups
        ? subscriptionData.data.sentWaGroupMessage
        : subscriptionData.data.sentMessage;
      contactId = groups
        ? subscriptionData.data.sentWaGroupMessage.waGroupId
        : subscriptionData.data.sentMessage.receiver.id;
      break;
    case 'RECEIVED':
      // set the sender contact id
      newMessage = groups
        ? subscriptionData.data.receivedWaGroupMessage
        : subscriptionData.data.receivedMessage;
      contactId = groups
        ? subscriptionData.data.receivedWaGroupMessage.waGroupId
        : subscriptionData.data.receivedMessage.sender.id;
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
    default:
      break;
  }

  return {
    newMessage,
    contactId,
    collectionId,
    messageStatusData,
  };
};

export const updateSimulatorConversations = (
  cachedConversations: any,
  subscriptionData: any,
  action: string
) => {
  // if there is no message data then return previous conversations
  if (!subscriptionData.data) {
    return cachedConversations;
  }

  if (!cachedConversations || !cachedConversations.search) {
    return null;
  }

  let newMessage: any;
  let contactId: number = 0;

  switch (action) {
    case 'SENT': {
      // set the receiver contact id
      const { sentSimulatorMessage } = subscriptionData.data;
      newMessage = sentSimulatorMessage;
      contactId = sentSimulatorMessage.receiver.id;
      break;
    }
    case 'RECEIVED': {
      // set the sender contact id
      const { receivedSimulatorMessage } = subscriptionData.data;
      newMessage = receivedSimulatorMessage;
      contactId = receivedSimulatorMessage.sender.id;
      break;
    }
    default:
      break;
  }

  const updatedConversations = JSON.parse(JSON.stringify(cachedConversations));
  const updatedConversation = updatedConversations.search[0];

  // Add new message and move the conversation to the top
  if (newMessage && updatedConversation.contact.id === contactId) {
    updatedConversation.messages.unshift(newMessage);
  }
  return updatedConversations;
};
