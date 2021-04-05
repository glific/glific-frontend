import { gql } from '@apollo/client';

export const CREATE_BILLING_SUBSCRIPTION = gql`
  mutation createBillingSubscription($input: PaymentMethodInput!) {
    createBillingSubscription(input: $input) {
      errors {
        key
        message
      }
    }
  }
`;

export default CREATE_BILLING_SUBSCRIPTION;
