// This service includes all the actions related to conversations storing

import { SEARCH_QUERY_VARIABLES } from '../common/constants';
import { SEARCH_QUERY } from '../graphql/queries/Search';

// write conversation to cache
export const saveConverations = (conversation: any, client: any) => {
  const queryVariables = SEARCH_QUERY_VARIABLES;
  const conversations = client.readQuery({
    query: SEARCH_QUERY,
    variables: queryVariables,
  });

  const conversationCopy = JSON.parse(JSON.stringify(conversation));
  conversationCopy.search[0].messages
    .sort((currentMessage: any, nextMessage: any) => {
      return currentMessage.id - nextMessage.id;
    })
    .reverse();

  const conversationsCopy = JSON.parse(JSON.stringify(conversations));
  conversationsCopy.search.unshift(conversationCopy.search[0]);
  client.writeQuery({
    query: SEARCH_QUERY,
    variables: queryVariables,
    data: conversationsCopy,
  });
};

// read the conversation from cache
export const getConverations = () => {};
