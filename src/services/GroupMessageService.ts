// This service includes all the actions related to conversations storing

import { cache } from 'config/apolloclient';
import { GROUP_SEARCH_QUERY } from 'graphql/queries/WA_Groups';

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
