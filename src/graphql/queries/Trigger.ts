import { gql } from '@apollo/client';

export const TRIGGER_LIST_QUERY = gql`
  query triggers($filter: TriggerFilter, $opts: Opts) {
    triggers(filter: $filter, opts: $opts) {
      id
      name
      days
      frequency
      flow {
        id
        name
      }
      groups
      roles {
        id
        label
      }
      nextTriggerAt
      endDate
      isActive
      isRepeating
      startAt
    }
  }
`;

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
        groups
        hours
        roles {
          id
          label
        }
        id
        isActive
        isRepeating
        startAt
        waGroups
      }
    }
  }
`;

export const TRIGGER_QUERY_COUNT = gql`
  query countTriggers($filter: TriggerFilter!) {
    countTriggers(filter: $filter)
  }
`;
