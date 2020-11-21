import { gql } from '@apollo/client';

const PERIODIC_INFO_SUBSCRIPTION = gql`
  subscription($organizationId: ID!) {
    periodicInfo(organizationId: $organizationId) {
      key
      value
    }
  }
`;

export { PERIODIC_INFO_SUBSCRIPTION as default };
