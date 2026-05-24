import { gql } from '@apollo/client';

export const GET_ASK_GLIFIC_CONVERSATIONS = gql`
  query AskGlificConversations($limit: Int, $lastId: String) {
    askGlificConversations(limit: $limit, lastId: $lastId) {
      conversations {
        id
        name
        status
        createdAt
        updatedAt
      }
      hasMore
      limit
    }
  }
`;

export const GET_ASK_GLIFIC_MESSAGES = gql`
  query AskGlificMessages($conversationId: String!, $limit: Int, $firstId: String) {
    askGlificMessages(conversationId: $conversationId, limit: $limit, firstId: $firstId) {
      messages {
        id
        conversationId
        query
        answer
        createdAt
        feedback
      }
      hasMore
      limit
    }
  }
`;
