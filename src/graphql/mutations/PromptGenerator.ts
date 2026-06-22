import { gql } from '@apollo/client';

export const GENERATE_PROMPT = gql`
  mutation GeneratePrompt($input: PromptGeneratorInput!) {
    generatePrompt(input: $input) {
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
