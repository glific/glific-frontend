import { gql } from '@apollo/client';

export const GET_CONSULTING_HOURS_BY_ID = gql`
  query consultingHour($id: ID!) {
    consultingHour(id: $id) {
      participants
      organization_id
      organization_name
      staff
      content
      when
      duration
      is_billable
      organization {
        name
        shortcode
      }
    }
  }
`;

export const GET_CONSULTING_HOURS = gql`
  query consultingHours($filter: ConsultingHourFilter, $opts: Opts) {
    consultingHours(filter: $filter, opts: $opts) {
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
