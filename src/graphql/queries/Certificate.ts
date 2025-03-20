import { gql } from '@apollo/client';

export const LIST_CERTIFICATES = gql`
  query CertificateTemplates($filter: CertificateTemplateFilter, $opts: Opts) {
    certificateTemplates(filter: $filter, opts: $opts) {
      id
      description
      label
      type
      url
    }
  }
`;

export const COUNT_CERTIFICATES = gql`
  query RootQueryType($filter: CertificateTemplateFilter) {
    countCertificateTemplates(filter: $filter)
  }
`;

export const GET_CERTIFICATE = gql`
  query CertificateTemplate($id: ID!) {
    certificateTemplate(id: $id) {
      certificateTemplate {
        id
        label
        type
        url
        description
      }
      errors {
        message
        key
      }
    }
  }
`;
