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
