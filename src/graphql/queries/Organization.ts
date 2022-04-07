import { gql } from '@apollo/client';

export const GET_ORGANIZATION = gql`
  query organization($id: ID) {
    organization(id: $id) {
      organization {
        id
        name
        contact {
          phone
        }
        outOfOffice {
          defaultFlowId
          enabled
          enabledDays {
            id
            enabled
          }
          startTime
          endTime
          flowId
        }
        defaultLanguage {
          id
          label
        }
        activeLanguages {
          id
          label
        }
        signaturePhrase
        newcontactFlowId
      }
    }
  }
`;

export const GET_PROVIDERS = gql`
  query providers($filter: ProviderFilter, $opts: Opts) {
    providers(filter: $filter, opts: $opts) {
      id
      name
      shortcode
      description
      keys
      secrets
      group
      isRequired
    }
  }
`;

export const GET_CREDENTIAL = gql`
  query credential($shortcode: String!) {
    credential(shortcode: $shortcode) {
      credential {
        id
        isActive
        keys
        secrets
        provider {
          shortcode
        }
      }
    }
  }
`;

export const USER_LANGUAGES = gql`
  query currentUserOrganisationLanguages {
    currentUser {
      user {
        organization {
          activeLanguages {
            id
            label
            localized
            locale
          }
          defaultLanguage {
            id
            label
          }
        }
      }
    }
  }
`;

export const BSPBALANCE = gql`
  query bspbalance {
    bspbalance
  }
`;

export const GET_ORGANIZATION_COUNT = gql`
  query countOrganizations($filter: OrganizationFilter!) {
    countOrganizations(filter: $filter)
  }
`;

export const FILTER_ORGANIZATIONS = gql`
  query organizations($filter: OrganizationFilter!, $opts: Opts!) {
    organizations(filter: $filter, opts: $opts) {
      id
      name
      status
      insertedAt
    }
  }
`;

export const GET_ORGANIZATION_SERVICES = gql`
  query organizationServices {
    organizationServices {
      dialogflow
      googleCloudStorage
      flowUuidDisplay
    }
  }
`;

export const GET_ORGANIZATION_PROVIDER = gql`
  query provider {
    organization {
      organization {
        bsp {
          shortcode
        }
      }
    }
  }
`;

export const GET_ORGANIZATION_PHONE = gql`
  query organizationPhone {
    organization {
      organization {
        contact {
          phone
        }
      }
    }
  }
`;
