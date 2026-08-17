import { gql } from 'config/gql';

export const ASSISTANT_CHAT_RESPONSE = gql`
  subscription AssistantChatResponse {
    assistantChatResponse {
      answer
      conversationId
      jobId
      requestId
      errors {
        key
        message
      }
    }
  }
`;
