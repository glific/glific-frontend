import { gql } from '@apollo/client';

export const GET_CONVERSATION_QUERY = gql`
  query conversations($number: Int!, $size: Int!) {
    conversations(numberOfConversations: $number, sizeOfConversations: $size) {
      contact {
        id
        name
      }
      messages {
        id
        body
      }
    }
  }
`;

export const GET_CONVERSATION_MESSAGE_QUERY = gql`
  query conversations($number: Int!, $size: Int!, $filter: ConversationFilter) {
    conversations(numberOfConversations: $number, sizeOfConversations: $size, filter: $filter) {
      contact {
        id
        name
      }
      messages {
        id
        body
        receiver {
          id
        }
        sender {
          id
        }
      }
    }
  }
`;
