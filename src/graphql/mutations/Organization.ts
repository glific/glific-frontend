import { gql } from '@apollo/client';

export const UPDATE_ORGANIZATION = gql`
  mutation updateOrganization($id: ID!, $input: OrganizationInput!) {
    updateOrganization(id: $id, input: $input) {
      organization {
        id
        name
        displayName
        providerKey
        providerNumber
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
        name
        displayName
        contactName
        email
        provider {
          id
          name
        }
        providerKey
        providerNumber
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
