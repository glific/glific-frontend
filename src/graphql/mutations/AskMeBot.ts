import { gql } from '@apollo/client';

export const ASK_ME_BOT = gql`
  mutation AskmeBot($input: AskmeBotInput!) {
    askmeBot(input: $input) {
      answer
      conversationId
      errors {
        message
      }
    }
  }
`;
