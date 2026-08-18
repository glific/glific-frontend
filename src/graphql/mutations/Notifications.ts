import { gql } from 'config/gql';

export const MARK_NOTIFICATIONS_AS_READ = gql`
  mutation markNotificationAsRead {
    markNotificationAsRead
  }
`;
export default MARK_NOTIFICATIONS_AS_READ;
