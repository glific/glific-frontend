import { gql } from '@apollo/client';

export const UPLOAD_KNOWLEDGE_BASE = gql`
  mutation UploadKnowledgeBase($categoryId: ID!, $media: Upload!) {
    uploadKnowledgeBase(categoryId: $categoryId, media: $media) {
      msg
    }
  }
`;

export const DELETE_KNOWLEDGE_BASE = gql`
  mutation DeleteKnowledgeBase($uuid: UUID4!) {
    deleteKnowledgeBase(uuid: $uuid) {
      msg
    }
  }
`;

export const CREATE_CATEGORY = gql`
  mutation CreateCategory($name: String!) {
    createCategory(name: $name) {
      id
      name
      uuid
    }
  }
`;
