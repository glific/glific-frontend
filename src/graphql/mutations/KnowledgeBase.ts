import { gql } from '@apollo/client';

export const UPLOAD_KNOWLEDGE_BASE = gql`
  mutation UploadKnowledgeBase($categoryId: ID!, $media: Upload!) {
    uploadKnowledgeBase(categoryId: $categoryId, media: $media) {
      msg
    }
  }
`;
