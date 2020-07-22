import { gql } from '@apollo/client';

export const GET_FLOWS = gql`
  {
    flows {
      id
      name
      shortcode
    }
  }
`;

export const GET_FLOW = gql`
  query getFlow($id: ID!) {
    flow(id: $id) {
      flow {
        id
        name
        shortcode
        language {
          id
        }
        uuid
      }
    }
  }
`;

export const GET_FLOW_COUNT = gql`
  query countTags($filter: TagFilter!) {
    countTags(filter: $filter)
  }
`;

export const FILTER_FLOW = gql`
  query tags($filter: TagFilter!, $opts: Opts!) {
    tags(filter: $filter, opts: $opts) {
      id
      label
      description
      keywords
    }
  }
`;
