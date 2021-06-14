import { gql } from '@apollo/client';

export const BSP_BALANCE_SUBSCRIPTION = gql`
  subscription ($organizationId: ID!) {
    bspBalance(organizationId: $organizationId)
  }
`;

export const COLLECTION_COUNT_SUBSCRIPTION = gql`
  subscription ($organizationId: ID!) {
    collectionCount(organizationId: $organizationId)
  }
`;

export const SIMULATOR_RELEASE_SUBSCRIPTION = gql`
  subscription ($organizationId: ID!) {
    simulatorRelease(organizationId: $organizationId)
  }
`;
