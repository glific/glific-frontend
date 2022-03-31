import { gql } from '@apollo/client';

export const GET_SIMULATOR = gql`
  query MyQuery {
    simulatorGet {
      id
      phone
      name
    }
  }
`;

export const RELEASE_SIMULATOR = gql`
  query MyQuery {
    simulatorRelease {
      id
    }
  }
`;

export const SIMULATOR_MESSAGE_FRAGMENT = `
    id
    body
    insertedAt
    receiver {
      id
    }
    sender {
      id
    }
    bspMessageId
    type
    media {
      url
      caption
    }
    location {
      latitude
      longitude
    }
    interactiveContent
`;

export const SIMULATOR_SEARCH_QUERY = gql`
  query search($filter: SearchFilter!, $contactOpts: Opts!, $messageOpts: Opts!) {
    search(filter: $filter, contactOpts: $contactOpts, messageOpts: $messageOpts) {
      contact {
        id
        name 
        phone
      }
      messages {
        ${SIMULATOR_MESSAGE_FRAGMENT}
      }
    }
  }
`;
