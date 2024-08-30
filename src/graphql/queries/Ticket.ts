import { gql } from '@apollo/client';

export const TICKET_LIST_QUERY = gql`
  query Tickets($filter: TicketFilter, $opts: Opts) {
    tickets(filter: $filter, opts: $opts) {
      body
      contact {
        id
        name
        fields
        maskedPhone
      }
      id
      insertedAt
      remarks
      status
      topic
      updatedAt
      messageNumber
      user {
        id
        name
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
          name
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

export const EXPORT_SUPPORT_TICKETS = gql`
  query fetchSupportTickets($filter: FetchSupportTickets) {
    fetchSupportTickets(filter: $filter)
  }
`;

export const UPDATE_TICKETS_STATUS = gql`
  mutation UpdateTicketStatusBasedOnTopic($input: UpdateTicketStatusBasedOnTopic) {
    updateTicketStatusBasedOnTopic(input: $input) {
      message
      success
    }
  }
`;
