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
  // write the updated conversations to cached
  cache.writeQuery({
    query: GROUP_SEARCH_QUERY,
    variables: queryVariables,
    data: conversations,
  });
};

// write conversation to cache
export const updateGroupConversations = (conversation: any, queryVariables: any) => {
  // get the current conversations from the cache
  const conversations = getCachedGroupConverations(queryVariables);

  // make a copy of current conversation
  const conversationCopy = JSON.parse(JSON.stringify(conversation));

  // make a copy of current conversations
  const conversationsCopy = JSON.parse(JSON.stringify(conversations));

  // add new conversation to conversations
  conversationsCopy.search = [...conversationsCopy.search, ...conversationCopy.search];

  // update conversations
  updateGroupConversationsCache(conversationsCopy, queryVariables);
};

export const saveGroupConversation = (conversation: any, queryVariables: any) => {
  // parse the conversation
  const conversationCopy = JSON.parse(JSON.stringify(conversation));

  // TODOS: need to check why we need this.
  conversationCopy.search[0].messages
    .sort((currentMessage: any, nextMessage: any) => currentMessage.id - nextMessage.id)
    .reverse();

  updateGroupConversations(conversation, queryVariables);
};
