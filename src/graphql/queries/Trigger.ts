import { gql } from '@apollo/client';

export const GET_TRIGGER = gql`
  query getTrigger($id: ID!) {
    trigger(id: $id) {
      trigger {
        days
        endDate
        flow {
          id
        }
        frequency
        group {
          id
        }
        id
        isActive
        isRepeating
        startAt
      }
    }
  }
`;

export default GET_TRIGGER;
