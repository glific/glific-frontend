import { gql } from '@apollo/client';

export const GET_ORGANIZATION = gql`
  query organization($id: ID) {
    organization(id: $id) {
      organization {
        id
        name
        provider {
          apiEndPoint
          id
          name
          url
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
      }
    }
  }
`;
