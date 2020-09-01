import { gql } from '@apollo/client';

export const GET_ORGANIZATIONS = gql`
  query organizations($filter: OrganizationFilter, $opts: Opts) {
    organizations(filter: $filter, opts: $opts) {
      id
      isActive
      name
      providerKey
      providerPhone
      shortcode
    }
  }
`;

export const GET_ORGANIZATION = gql`
  query organization($id: ID!) {
    organization(id: $id) {
      organization {
        id
        shortcode
        provider {
          apiEndPoint
          id
          name
          url
        }
        providerKey
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
      }
    }
  }
`;
