import { gql } from '@apollo/client';

export const TRIGGER_LIST_QUERY = gql`
  query triggers($filter: TriggerFilter, $opts: Opts) {
    triggers(filter: $filter, opts: $opts) {
      id
      name
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
