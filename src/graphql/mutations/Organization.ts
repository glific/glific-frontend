import { gql } from '@apollo/client';

export const UPDATE_ORGANIZATION = gql`
  mutation updateOrganization($id: ID!, $input: OrganizationInput!) {
    updateOrganization(id: $id, input: $input) {
      organization {
        id
        shortcode
        name
        providerAppname
        providerPhone
        outOfOffice {
          enabled
          startTime
          endTime
          flowId
          enabledDays {
            id
            enabled
          }
        }
        activeLanguages {
          id
          label
        }
      }
      errors {
        key
        message
      }
    }
  }
`;

export const CREATE_ORGANIZATION = gql`
  mutation createOrganization($input: OrganizationInput!) {
    createOrganization(input: $input) {
      organization {
        id
        shortcode
        name
        contactName
        email
        provider {
          id
          name
        }
        providerAppname
        providerPhone
        defaultLanguage {
          id
          label
        }
      }
      errors {
        key
        message
      }
    }
  }
`;

export const DELETE_ORGANIZATION = gql`
  mutation deleteOrganization($id: ID!) {
    deleteOrganization(id: $id) {
      errors {
        key
        message
      }
    }
  }
`;
