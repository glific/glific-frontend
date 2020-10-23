// This service includes all the actions related to conversations storing

import { SEARCH_QUERY_VARIABLES } from '../common/constants';
import { SEARCH_QUERY } from '../graphql/queries/Search';

const queryVariables = SEARCH_QUERY_VARIABLES;

// write conversation to cache
export const saveConverations = (conversation: any, client: any) => {
  // get the current conversations from the cache
  const conversations = getCachedConverations(client);

  // parese the conversation
  const conversationCopy = JSON.parse(JSON.stringify(conversation));

  // TODOS: need to check why we need this.
  conversationCopy.search[0].messages
    .sort((currentMessage: any, nextMessage: any) => {
      return currentMessage.id - nextMessage.id;
    })
    .reverse();

  // make a copy of current conversations
  const conversationsCopy = JSON.parse(JSON.stringify(conversations));

  // add new conversation
  conversationsCopy.search.unshift(conversationCopy.search[0]);

  // update conversations
  updateConversationCache(conversationsCopy, client);
};

// read the conversation from cache
export const getCachedConverations = (client: any) => {
  // fetch conversations from the cache
  const conversations = client.readQuery({
    query: SEARCH_QUERY,
    variables: queryVariables,
  });

  return conversations;
};

// update the conversations cache
export const updateConversationCache = (conversations: any, client: any) => {
  // write the updated conversations to cached
  client.writeQuery({
    query: SEARCH_QUERY,
    variables: queryVariables,
    data: conversations,
  });
};
