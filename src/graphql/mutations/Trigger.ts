import { gql } from '@apollo/client';

export const DELETE_TRIGGER = gql`
  mutation deleteTrigger($id: ID!) {
    deleteTrigger(id: $id) {
      errors {
        key
        message
      }
    }
  }
`;

export const VALIDATE_TRIGGER = gql`
  mutation ValidateTrigger($input: TriggerInput!) {
    validateTrigger(input: $input) {
      errors {
        key
        message
      }
      success
    }
  }
`;

export const CREATE_TRIGGER = gql`
  mutation createTrigger($input: TriggerInput!) {
    createTrigger(input: $input) {
      trigger {
        days
        endDate
        flow {
          id
        }
        frequency
        groups
        id
        isActive
        hours
        isRepeating
        name
        startAt
      }
    }
  }
`;

export const UPDATE_TRIGGER = gql`
  mutation updateTrigger($id: ID!, $input: TriggerInput!) {
    updateTrigger(id: $id, input: $input) {
      trigger {
        days
        endDate
        flow {
          id
        }
        frequency
        groups
        id
        isActive
        hours
        isRepeating
        name
        startAt
      }
    }
  }
`;
