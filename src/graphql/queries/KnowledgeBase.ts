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
      uuid
    }
  }
`;
