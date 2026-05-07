import { gql } from '@apollo/client';

export const ASK_GLIFIC_RESPONSE_SUBSCRIPTION = gql`
  subscription AskGlificResponse($organizationId: ID!) {
    askGlificResponse(organizationId: $organizationId) {
      answer
      conversationId
      conversationName
      messageId
      errors {
        message
      }
    }
  }
`;
