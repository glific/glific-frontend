import { gql } from '@apollo/client';

export const GET_ASKME_BOT_CONVERSATIONS = gql`
  query AskmeBotConversations($limit: Int, $lastId: String) {
    askmeBotConversations(limit: $limit, lastId: $lastId) {
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

export const GET_ASKME_BOT_MESSAGES = gql`
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
