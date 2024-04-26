import { gql } from '@apollo/client';

export const GET_KNOWLEDGE_BASE = gql`
  query KnowledgeBases {
    knowledgeBases {
      category {
        id
        name
        uuid
      }
      name
      id: uuid
    }
  }
`;

export const GET_CATEGORIES = gql`
  query Categories {
    categories {
      id
      name
      uuid
    }
  }
`;
