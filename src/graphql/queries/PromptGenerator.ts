import { gql } from '@apollo/client';

export const LATEST_PROMPT_GENERATION = gql`
  query LatestPromptGeneration {
    latestPromptGeneration {
      promptGeneration {
        id
        status
        inputs
      }
      errors {
        key
        message
      }
    }
  }
`;

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
