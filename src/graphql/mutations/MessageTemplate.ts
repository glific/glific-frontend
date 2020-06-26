import { gql } from '@apollo/client';

export const SAVE_MESSAGE_TEMPLATE_MUTATION = gql`
  mutation createTemplateFormMessage($messageId: ID!, $templateInput: MessageToTemplateInput!) {
    createTemplateFormMessage(messageId: $messageId, input: $templateInput) {
      sessionTemplate {
        id
        body
        label
      }

      errors {
        message
      }
    }
  }
`;
