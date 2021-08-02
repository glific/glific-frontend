// This service includes all the actions related to conversations storing

import { SEARCH_QUERY } from 'graphql/queries/Search';

// read the conversation from cache
export const getCachedConverations = (client: any, queryVariables: any) => {
  // fetch conversations from the cache
  const conversations = client.readQuery({
    query: SEARCH_QUERY,
    variables: queryVariables,
  });

  return conversations;
};

// update the conversations cache
export const updateConversationsCache = (conversations: any, client: any, queryVariables: any) => {
  // write the updated conversations to cached
  client.writeQuery({
    query: SEARCH_QUERY,
    variables: queryVariables,
    data: conversations,
  });
};

// write conversation to cache
export const updateConversations = (conversation: any, client: any, queryVariables: any) => {
  // get the current conversations from the cache
  const conversations = getCachedConverations(client, queryVariables);

  // make a copy of current conversation
  const conversationCopy = JSON.parse(JSON.stringify(conversation));

  // make a copy of current conversations
  const conversationsCopy = JSON.parse(JSON.stringify(conversations));

  // add new conversation to conversations
  conversationsCopy.search = [...conversationsCopy.search, ...conversationCopy.search];

  // update conversations
  updateConversationsCache(conversationsCopy, client, queryVariables);
};

export const saveConversation = (conversation: any, client: any, queryVariables: any) => {
  // parse the conversation
  const conversationCopy = JSON.parse(JSON.stringify(conversation));

  // TODOS: need to check why we need this.
  conversationCopy.search[0].messages
    .sort((currentMessage: any, nextMessage: any) => currentMessage.id - nextMessage.id)
    .reverse();

  updateConversations(conversation, client, queryVariables);
};
