// This service includes all the actions related to conversations storing

import { cache } from 'config/apolloclient';
import { GROUP_SEARCH_QUERY } from 'graphql/queries/WaGroups';

// read the conversation from cache
export const getCachedGroupConverations = (queryVariables: any) => {
  // fetch conversations from the cache
  const conversations = cache.readQuery({
    query: GROUP_SEARCH_QUERY,
    variables: queryVariables,
  });

  return conversations;
};

// update the conversations cache
export const updateGroupConversationsCache = (conversations: any, queryVariables: any) => {
  cache.writeQuery({
    query: GROUP_SEARCH_QUERY,
    variables: queryVariables,
    data: conversations,
  });
};

// write conversation to cache
export const updateGroupConversations = (
  conversation: any,
  queryVariables: any,
  newConversation?: boolean
) => {
  // gcurrent conversations
  const conversations = getCachedGroupConverations(queryVariables);

  // current conversation
  const conversationCopy = JSON.parse(JSON.stringify(conversation));

  // copy of current conversations
  const conversationsCopy = JSON.parse(JSON.stringify(conversations));

  // add new conversation to conversations
  if (newConversation) {
    conversationsCopy.search = [...conversationCopy.search, ...conversationsCopy.search];
  } else {
    conversationsCopy.search = [...conversationsCopy.search, ...conversationCopy.search];
  }

  // update conversations
  updateGroupConversationsCache(conversationsCopy, queryVariables);
};

export const saveGroupConversation = (conversation: any, queryVariables: any) => {
  updateGroupConversations(conversation, queryVariables, true);
};

export const updateCacheQuery = (
  cacheConversations: any,
  fetchMoreResult: any,
  entityId: any,
  collectionId: any,
  chatType: string,
  updateMessage?: boolean
) => {
  const conversations = JSON.parse(JSON.stringify(cacheConversations));
  const conversationCopy = JSON.parse(JSON.stringify(fetchMoreResult));

  conversationCopy.search[0].messages
    .sort((currentMessage: any, nextMessage: any) => currentMessage.id - nextMessage.id)
    .reverse();

  let conversationsCopy: any = { search: [] };
  if (JSON.parse(JSON.stringify(conversations))) {
    conversationsCopy = JSON.parse(JSON.stringify(conversations));
  }
  let isContactCached = false;

  const updateConversation = (conversationObj: any) => {
    if (updateMessage) {
      conversationObj.messages = [
        ...conversationObj.messages,
        ...conversationCopy.search[0].messages,
      ];
    }
    return conversationObj;
  };

  conversationsCopy.search = conversationsCopy.search.map((conversation: any) => {
    if (collectionId && conversation.group?.id === collectionId.toString()) {
      isContactCached = true;
      return updateConversation(conversation);
    }
    if (conversation[chatType]?.id === entityId?.toString()) {
      isContactCached = true;
      return updateConversation(conversation);
    }
    return conversation;
  });

  if (!isContactCached) {
    conversationsCopy.search = [...conversationsCopy.search, fetchMoreResult.search[0]];
  }

  return conversationsCopy;
};
