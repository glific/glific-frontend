import { gql } from '@apollo/client';

export const ASK_GLIFIC_RESPONSE_SUBSCRIPTION = gql`
  subscription ($organizationId: ID!) {
    askGlificResponse(organizationId: $organizationId) {
      answer
      conversationId
      errors {
        message
      }
    }
  }
`;
