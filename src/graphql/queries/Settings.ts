import { gql } from 'config/gql';

export const GET_ATTACHMENT_PERMISSION = gql`
  query attachmentsEnabled {
    attachmentsEnabled
  }
`;

export default GET_ATTACHMENT_PERMISSION;
