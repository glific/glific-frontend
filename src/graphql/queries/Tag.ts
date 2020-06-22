import { gql } from '@apollo/client';

export const GET_TAGS = gql`
  {
    tags {
      id
      label
      description
    }
  }
`;

export const GET_TAG = gql`
  query getTag($id: ID!) {
    tag(id: $id) {
      tag {
        id
        label
        description
        isActive
        isReserved
        language {
          id
        }
      }
    }
  }
`;

export const GET_TAGS_COUNT = gql`
  query countTags($filter: TagFilter!) {
    countTags(filter: $filter)
  }
`;

export const FILTER_TAGS = gql`
  query tags($filter: TagFilter!, $opts: Opts!) {
    tags(filter: $filter, opts: $opts) {
      id
      label
      description
    }
  }
`;

export const GET_LANGUAGES = gql`
  {
    languages {
      id
      label
    }
  }
`;
