import { gql } from '@apollo/client';

export const GET_POLLS = gql`
  query WaPolls($filter: WaPollFilter, $opts: Opts) {
    poll: waPolls(filter: $filter, opts: $opts) {
      allowMultipleAnswer
      id
      label
      pollContent
      uuid
    }
  }
`;

export const GET_POLL = gql`
  query WaPoll($id: ID!) {
    waPoll(id: $id) {
      waPoll {
        id
        label
        pollContent
        allowMultipleAnswer
      }
      errors {
        message
      }
    }
  }
`;

export const GET_POLLS_COUNT = gql`
  query RootQueryType($filter: WaPollFilter) {
    countPoll: countWaPolls(filter: $filter)
  }
`;
