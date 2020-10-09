import { gql } from '@apollo/client';

export const GET_ORGANIZATION = gql`
  query organization($id: ID) {
    organization(id: $id) {
      organization {
        id
        name
        outOfOffice {
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
