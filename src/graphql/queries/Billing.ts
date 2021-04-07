import { gql } from '@apollo/client';

export const GET_ORGANIZATION_BILLING = gql`
  query getOrganizationBilling {
    getOrganizationBilling {
      billing {
        currency
        email
        isActive
        stripeSubscriptionId
        stripeSubscriptionItems
      }
    }
  }
`;

export default GET_ORGANIZATION_BILLING;
