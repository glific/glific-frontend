import { gql } from '@apollo/client';

export const GET_TAGS = gql`
  query Tags($filter: TagFilter) {
    tags(filter: $filter) {
      label,
      id,
    }
  }
`;

export const GET_TAG = gql`
  query getTag($id: ID!) {
    tag(id: $id) {
      tag {
        id
        description
        colorCode
        insertedAt
        isActive
        isReserved
        keywords
        label
        language {
          id
          label
        }
        parent {
          id
          label
        }
        shortcode
        updatedAt
      }
    }
  }
`;


export const FILTER_TAGS = gql`
  query Tags($filter: TagFilter, $opts: Opts) {
    tags(filter: $filter, opts: $opts) {
      id
      description
      colorCode
      insertedAt
      isActive
      isReserved
      keywords
      label
      language {
        id
        label
      }
      parent {
        id
        label
      }
      shortcode
      updatedAt
      }
  }
`;

export const GET_TAG_COUNT = gql`
  query countTags($filter: TagFilter){
    countTags(filter: $filter)
  }
`;