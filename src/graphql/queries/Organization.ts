import { gql } from '@apollo/client';

export const GET_ORGANIZATION = gql`
  query organization($id: ID) {
    organization(id: $id) {
      organization {
        id
        name
        provider {
          id
          name
        }
        providerAppname
        providerPhone
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
        keys
        secrets
        provider {
          shortcode
        }
      }
    }
  }
`;
