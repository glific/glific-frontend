import { gql } from '@apollo/client';

export const GET_ATTACHMENT_PERMISSION = gql`
  query attachmentsEnabled {
    attachmentsEnabled
  }
`;

export default GET_ATTACHMENT_PERMISSION;
