import { gql } from '@apollo/client';

export const GET_POLLS = gql`
  query WaPolls($filter: WaPollFilter, $opts: Opts) {
    poll: waPolls(filter: $filter, opts: $opts) {
      allowMultipleAnswer
      id
      label
      pollContent
    }
  }
`;

export const GET_POLL = gql`
  query WaPoll($waPollId: ID!) {
    waPoll(id: $waPollId) {
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
    countWaPolls(filter: $filter)
  }
`;
