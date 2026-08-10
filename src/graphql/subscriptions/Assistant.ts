import { gql } from '@apollo/client';

export const LLM_CALL_RESPONSE_SUBSCRIPTION = gql`
  subscription LlmCallResponse($organizationId: ID!) {
    llmCallResponse(organizationId: $organizationId) {
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
