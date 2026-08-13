import { gql } from '@apollo/client';

/**
 * Staff-authenticated web inbound for the flow preview simulator (contract §13.2).
 *
 * The WhatsApp simulator forges a Gupshup BSP callback, which by construction can only ever
 * produce WhatsApp inbound. This mutation is the web-channel equivalent: it funnels into the
 * same `Communications.WebMessage.receive_message/2`, so the engine's channel fork sees an
 * inbound message with `channel: "web"` and the flow takes the web branch.
 *
 * The interface below is FROZEN by §13.2 — do not add or rename fields here without the
 * contract changing first.
 */
export const SIMULATOR_WEB_MESSAGE = gql`
  mutation simulatorWebMessage($input: SimulatorWebMessageInput!) {
    simulatorWebMessage(input: $input) {
      message {
        id
        body
        type
        channel
      }
      errors {
        key
        message
      }
    }
  }
`;
