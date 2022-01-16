import { gql } from '@apollo/client';
import { SIMULATOR_MESSAGE_FRAGMENT } from 'graphql/queries/Simulator';

// need to replaced by simulator subscriptions
export const SIMULATOR_MESSAGE_RECEIVED_SUBSCRIPTION = gql`
  subscription ($organizationId: ID!) {
    receivedSimulatorMessage(organizationId: $organizationId) {
       ${SIMULATOR_MESSAGE_FRAGMENT}
    }
  }
`;

export const SIMULATOR_MESSAGE_SENT_SUBSCRIPTION = gql`
  subscription ($organizationId: ID!) {
    sentSimulatorMessage(organizationId: $organizationId) {
      ${SIMULATOR_MESSAGE_FRAGMENT}
    }
  }
`;
