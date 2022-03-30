// This service includes all the actions related to conversations storing

import { cache } from 'config/apolloclient';
import { SEARCH_QUERY } from 'graphql/queries/Search';

// read the conversation from cache
export const getCachedConverations = (queryVariables: any) => {
  // fetch conversations from the cache
  const conversations = cache.readQuery({
    query: SEARCH_QUERY,
    variables: queryVariables,
  });

  return conversations;
};

// update the conversations cache
export const updateConversationsCache = (conversations: any, queryVariables: any) => {
  // write the updated conversations to cached
  cache.writeQuery({
    query: SEARCH_QUERY,
    variables: queryVariables,
    data: conversations,
  });
};

// write conversation to cache
export const updateConversations = (conversation: any, queryVariables: any) => {
  // get the current conversations from the cache
  const conversations = getCachedConverations(queryVariables);

  // make a copy of current conversation
  const conversationCopy = JSON.parse(JSON.stringify(conversation));

  // make a copy of current conversations
  const conversationsCopy = JSON.parse(JSON.stringify(conversations));

  // add new conversation to conversations
  conversationsCopy.search = [...conversationsCopy.search, ...conversationCopy.search];

  // update conversations
  updateConversationsCache(conversationsCopy, queryVariables);
};

export const saveConversation = (conversation: any, queryVariables: any) => {
  // parse the conversation
  const conversationCopy = JSON.parse(JSON.stringify(conversation));

  // TODOS: need to check why we need this.
  conversationCopy.search[0].messages
    .sort((currentMessage: any, nextMessage: any) => currentMessage.id - nextMessage.id)
    .reverse();

  updateConversations(conversation, queryVariables);
};
