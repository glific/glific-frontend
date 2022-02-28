import { gql } from '@apollo/client';

export const GET_CONSULTING_HOURS_BY_ID = gql`
  query consultingHour($id: ID!) {
    consultingHour(id: $id) {
      consultingHour {
        id
        content
        isBillable
        duration
        insertedAt
        participants
        staff
        organizationName
        updatedAt
        when
      }
    }
  }
`;

export const GET_CONSULTING_HOURS = gql`
  query consultingHours($filter: ConsultingHourFilter, $opts: Opts) {
    consultingHours(filter: $filter, opts: $opts) {
      id
      content
      isBillable
      duration
      insertedAt
      participants
      staff
      organizationName
      updatedAt
      when
    }
  }
`;

export const GET_CONSULTING_HOURS_COUNT = gql`
  query countConsultingHours($filter: ConsultingHourFilter) {
    countConsultingHours(filter: $filter)
  }
`;

export const EXPORT_CONSULTING_HOURS = gql`
  query FetchConsultingHours($filter: FetchConsultingHours) {
    fetchConsultingHours(filter: $filter)
  }
`;
