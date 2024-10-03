import { gql } from '@apollo/client';

export const CREATE_ASSISTANT = gql`
  mutation CreateAssistant($input: AssistantInput) {
    createAssistant(input: $input) {
      assistant {
        id
        name
      }
    }
  }
`;
