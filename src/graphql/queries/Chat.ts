import { gql } from '@apollo/client';

export const GET_CONVERSATION_QUERY = gql`
query conversations($nc: Int!, $sc: Int!) {
  conversations(numberOfConversations: $nc, sizeOfConversations: $sc) {
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
query conversations($nc: Int!, $sc: Int!, $filter: ConversationFilter) {
  conversations(numberOfConversations: $nc, sizeOfConversations: $sc, filter: $filter) {
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