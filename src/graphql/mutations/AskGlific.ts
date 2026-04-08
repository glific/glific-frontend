import { gql } from '@apollo/client';

export const ASK_GLIFIC = gql`
  mutation AskGlific($input: AskGlificInput!) {
    askGlific(input: $input) {
      answer
      conversationId
      conversationName
      errors {
        message
      }
    }
  }
`;
