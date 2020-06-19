import { gql } from '@apollo/client';

export const GET_CONVERSATION_QUERY = gql`
  query conversations($count: Int!, $size: Int!) {
    conversations(numberOfConversations: $count, sizeOfConversations: $size) {
      contact {
        id
        name
      }
      messages {
        id
        body
        insertedAt
        tags {
          id
          label
        }
      }
    }
  }
`;

export const GET_CONVERSATION_MESSAGE_QUERY = gql`
query conversation($size: Int!, $contactId: Gid!, $filter: ConversationFilter! ) {
  conversation(sizeOfConversations: $size, contactId: $contactId, filter: $filter) {
    contact {
      id
      name
    }
    messages {
      id
      body
      insertedAt
      receiver {
        id
      }
      sender {
        id
      }
      tags {
        id
        label
      }
    }
  }
}
`;
