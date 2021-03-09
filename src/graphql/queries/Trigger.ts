import { gql } from '@apollo/client';

export const TRIGGER_LIST_QUERY = gql`
  query triggers($filter: TriggerFilter) {
    triggers(filter: $filter) {
      flow {
        id
        name
      }
      group {
        id
        label
      }
      isActive
      isRepeating
      startAt
    }
  }
`;

export const TRIGGER_QUERY_COUNT = gql`
  query countTriggers($filter: TriggerFilter!) {
    countTriggers(filter: $filter)
  }
`;
