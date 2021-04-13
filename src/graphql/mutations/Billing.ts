import { gql } from '@apollo/client';

export const CREATE_BILLING_SUBSCRIPTION = gql`
  mutation createBillingSubscription($input: PaymentMethodInput!) {
    createBillingSubscription(input: $input) {
      errors
      subscription
    }
  }
`;

export const UPDATE_BILLING = gql`
  mutation updateBilling($id: ID!, $input: BillingInput!) {
    updateBilling(id: $id, input: $input) {
      billing {
        id
      }
      errors {
        key
        message
      }
    }
  }
`;

export default CREATE_BILLING_SUBSCRIPTION;
