import { gql } from 'config/gql';

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
