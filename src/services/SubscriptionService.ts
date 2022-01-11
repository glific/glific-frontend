import { SUBSCRIPTION_ALLOWED_DURATION, SUBSCRIPTION_ALLOWED_NUMBER } from 'common/constants';

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

export const getSubscriptionDetails = (action: string, subscriptionData: any) => {
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

  return {
    newMessage,
    contactId,
    collectionId,
    tagData,
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

  if (!cachedConversations) {
    return null;
  }

  let newMessage: any;
  let contactId: number = 0;

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
