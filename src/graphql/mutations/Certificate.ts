import { gql } from '@apollo/client';

export const CREATE_CERTIFICATE = gql`
  mutation CreateCertificateTemplate($input: CertificateTemplateInput!) {
    createCertificateTemplate(input: $input) {
      certificateTemplate {
        label
        id
      }
      errors {
        key
        message
      }
    }
  }
`;

export const UPDATE_CERTIFICATE = gql`
  mutation UpdateCertificateTemplate($id: ID!, $input: CertificateTemplateInput!) {
    updateCertificateTemplate(id: $id, input: $input) {
      certificateTemplate {
        id
        label
      }
      errors {
        message
        key
      }
    }
  }
`;

export const DELETE_CERTIFICATE = gql`
  mutation DeleteCertificateTemplate($id: ID!) {
    deleteCertificateTemplate(id: $id) {
      certificateTemplate {
        label
      }
      errors {
        key
        message
      }
    }
  }
`;
