import { gql } from '@apollo/client';

export const UPDATE_ORGANIZATION = gql`
  mutation updateOrganization($id: ID!, $input: OrganizationInput!) {
    updateOrganization(id: $id, input: $input) {
      organization {
        id
        shortcode
        name
        outOfOffice {
          defaultFlowId
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

export const CREATE_CREDENTIAL = gql`
  mutation createCredential($input: CredentialInput!) {
    createCredential(input: $input) {
      credential {
        keys
        secrets
      }
      errors {
        key
        message
      }
    }
  }
`;

export const UPDATE_CREDENTIAL = gql`
  mutation updateCredential($id: ID!, $input: CredentialInput!) {
    updateCredential(id: $id, input: $input) {
      credential {
        id
        provider {
          shortcode
        }
        keys
        secrets
      }
      errors {
        key
        message
      }
    }
  }
`;

export const UPDATE_ORGANIZATION_STATUS = gql`
  mutation updateOrganizationStatus(
    $updateOrganizationId: ID!
    $isActive: Boolean
    $isApproved: Boolean
  ) {
    updateOrganizationStatus(
      updateOrganizationId: $updateOrganizationId
      isActive: $isActive
      isApproved: $isApproved
    ) {
      organization {
        email
        isActive
        isApproved
        name
        shortcode
      }
      errors {
        key
        message
      }
    }
  }
`;

export const DELETE_INACTIVE_ORGANIZATIONS = gql`
  mutation deleteInactiveOrganization($deleteOrganizationID: ID!, $isConfirmed: Boolean) {
    deleteInactiveOrganization(
      deleteOrganizationID: $deleteOrganizationID
      isConfirmed: $isConfirmed
    ) {
      organization {
        email
        isActive
        isApproved
        name
        shortcode
      }
      errors {
        key
        message
      }
    }
  }
`;
