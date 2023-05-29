import { gql } from '@apollo/client';

export const UPDATE_TICKET = gql`
  mutation updateTicket($id: ID!, $input: TicketInput) {
    updateTicket(id: $id, input: $input) {
      ticket {
        body
        contact {
          id
        }
        id
        insertedAt
        remarks
        status
        topic
        updatedAt
        user {
          id
          name
        }
      }
    }
  }
`;
