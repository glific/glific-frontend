import { gql } from '@apollo/client';

export const GET_CONVERSATION_QUERY = gql`
  query conversations($contactOpts: Opts!, $filter: ConversationsFilter!, $messageOpts: Opts!) {
    conversations(contactOpts: $contactOpts, filter: $filter, messageOpts: $messageOpts) {
      contact {
        id
        name
        phone
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

export const GET_CONVERSATION_MESSAGE_QUERY = gql`
  query conversation($contactId: Gid!, $filter: ConversationFilter!, $messageOpts: Opts!) {
    conversation(contactId: $contactId, filter: $filter, messageOpts: $messageOpts) {
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

