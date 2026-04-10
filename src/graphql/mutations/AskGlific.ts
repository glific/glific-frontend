import { gql } from '@apollo/client';

export const ASK_GLIFIC = gql`
  mutation AskGlific($input: AskGlificInput!) {
    askGlific(input: $input) {
      answer
      conversationId
      errors {
        message
      }
    }
  }
`;
import { gql } from '@apollo/client';

export const ASK_GLIFIC = gql`
  mutation AskGlific($input: AskGlificInput!) {
    askGlific(input: $input) {
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

export const ASK_GLIFIC_FEEDBACK = gql`
  mutation AskGlificFeedback($input: AskGlificFeedbackInput!) {
    askGlificFeedback(input: $input) {
      success
    }
  }
`;
