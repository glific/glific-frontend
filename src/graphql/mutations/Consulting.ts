import { gql } from '@apollo/client';

export const CREATE_CONSULTING_HOUR = gql`
  mutation createConsultingHour($input: ConsultingHourInput!) {
    createConsultingHour(input: $input) {
      consultingHour {
        duration
        content
        isBillable
        insertedAt
        organizationName
        participants
        staff
        updatedAt
        when
      }
      errors {
        message
        key
      }
    }
  }
`;

export const UPDATE_CONSULTING_HOURS = gql`
  mutation updateConsultingHour($id: ID!, $input: ConsultingHourInput!) {
    updateConsultingHour(id: $id, input: $input) {
      consultingHour {
        duration
        content
        isBillable
        insertedAt
        organizationName
        participants
        staff
        updatedAt
        when
      }
      errors {
        message
        key
      }
    }
  }
`;

export const DELETE_CONSULTING_HOURS = gql`
  mutation deleteConsultingHour($id: ID!) {
    deleteConsultingHour(id: $id) {
      consultingHour {
        duration
        content
        isBillable
        insertedAt
        organizationName
        participants
        staff
        updatedAt
        when
      }
      errors {
        message
        key
      }
    }
  }
`;
