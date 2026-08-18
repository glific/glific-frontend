import { gql } from 'config/gql';

export const PROMPT_GENERATION = gql`
  query PromptGeneration($id: ID!) {
    promptGeneration(id: $id) {
      promptGeneration {
        id
        status
        generatedPrompt
        errorMessage
      }
      errors {
        key
        message
      }
    }
  }
`;
