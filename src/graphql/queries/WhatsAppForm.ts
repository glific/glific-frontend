import { gql } from '@apollo/client';

export const LIST_FORM_CATEGORIES = gql`
  query {
    whatsappFormCategories
  }
`;
