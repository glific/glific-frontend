import { gql } from '@apollo/client';

export const GET_ORGANIZATION_BILLING = gql`
  query getOrganizationBilling($organizationId: Gid) {
    getOrganizationBilling(organizationId: $organizationId) {
      billing {
        id
        name
        currency
        email
        isActive
        stripeSubscriptionId
        stripeSubscriptionItems
        stripeSubscriptionStatus
      }
    }
  }
`;

export const GET_CUSTOMER_PORTAL = gql`
  query getCustomerPortal {
    customerPortal {
      url
    }
  }
`;

export const GET_COUPON_CODE = gql`
  query getCouponCode($code: String!) {
    getCouponCode(code: $code) {
      code
      id
      metadata
    }
  }
`;

export default GET_ORGANIZATION_BILLING;
