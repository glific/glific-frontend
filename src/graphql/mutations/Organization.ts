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
