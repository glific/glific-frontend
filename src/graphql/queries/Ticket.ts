import { gql } from '@apollo/client';

export const TICKET_LIST_QUERY = gql`
  query Tickets($filter: TicketFilter, $opts: Opts) {
    tickets(filter: $filter, opts: $opts) {
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
      }
    }
  }
`;

export const GET_TICKET = gql`
  query getTicket($id: ID!) {
    ticket(id: $id) {
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
        }
      }
    }
  }
`;

export const TICKET_COUNT_QUERY = gql`
  query countTickets($filter: TicketFilter!) {
    countTickets(filter: $filter)
  }
`;
