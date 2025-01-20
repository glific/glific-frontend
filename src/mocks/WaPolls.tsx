import { COPY_POLL, CREATE_POLL, DELETE_POLL } from 'graphql/mutations/WaPolls';
import { filterRolesQuery } from './Role';
import { GET_POLL, GET_POLLS, GET_POLLS_COUNT } from 'graphql/queries/WaPolls';

const createPoll = {
  request: {
    query: CREATE_POLL,
  },
  result: {
    data: {
      createWaPoll: {
        errors: null,
        waPoll: {
          id: '8',
        },
      },
    },
  },
  variableMatcher: () => true,
};

const getPoll = {
  request: {
    query: GET_POLL,
    variables: {
      id: '1',
    },
  },
  result: {
    data: {
      waPoll: {
        __typename: 'WaPollResult',
        errors: null,
        waPoll: {
          allowMultipleAnswer: true,
          id: '8',
          label: 'Poll Title',
          pollContent:
            '{"text":"Poll Content","options":[{"name":"Option 1","id":0},{"name":"Option 3","id":0.6781005888671008}]}',
        },
      },
    },
  },
};

const copyPoll = {
  request: {
    query: COPY_POLL,
    variables: {
      id: '1',
      input: {
        label: 'Copy of Poll Title',
        poll_content:
          '{"options":[{"name":"Option 1","id":0},{"name":"Option 3","id":0.6781005888671008}],"text":"Poll Content"}',
        allow_multiple_answer: true,
      },
    },
  },
  result: {
    data: {
      copyWaPoll: {
        waPoll: {
          id: '2',
          label: 'Copy of Poll Title',
        },
      },
    },
  },
};

const listPollsQuery = {
  request: {
    query: GET_POLLS,
    variables: { filter: {}, opts: { limit: 50, offset: 0, order: 'ASC', orderWith: 'label' } },
  },
  result: {
    data: {
      poll: [
        {
          allowMultipleAnswer: false,
          id: '1',
          label: 'poll 1',
          pollContent: '{"text":"text","options":[{"name":"1","id":0},{"name":"2","id":1}]}',
          uuid: '6fa459ea-ee8a-3ca4-894e-db77e160355e',
        },
        {
          allowMultipleAnswer: true,
          id: '8',
          label: 'Poll Title',
          pollContent:
            '{"text":"Poll Content","options":[{"name":"Option 1","id":0},{"name":"Option 3","id":0.6781005888671008}]}',
          uuid: '550e8400-e29b-41d4-a716-446655440000',
        },
        {
          allowMultipleAnswer: true,
          id: '5',
          label: 'polllll',
          pollContent:
            '{"text":"How frequently do you participate in our activities or events, and what influences your level of involvement?","options":[{"name":"Everyday","id":0},{"name":"Once a week","id":1},{"name":"Monthly","id":2},{"name":"Never","id":3}]}',
          uuid: '123e4567-e89b-12d3-a456-426614174000',
        },
        {
          allowMultipleAnswer: false,
          id: '3',
          label: 'titek 1',
          pollContent: '{"text":"sdcfd","options":[{"name":"dfv","id":0},{"name":"sdf","id":1}]}',
          uuid: '9b2d9b1e-1c3e-4f5a-8b2d-9b1e1c3e4f5a',
        },
        {
          allowMultipleAnswer: false,
          id: '4',
          label: 'we',
          pollContent: '{"text":"s","options":[{"name":"dds","id":0},{"name":"ss","id":1}]}',
          uuid: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        },
      ],
    },
  },
};

const countPollsQuery = {
  request: {
    query: GET_POLLS_COUNT,
    variables: { filter: {} },
  },
  result: {
    data: {
      countPoll: 5,
    },
  },
};

const deletePollQuery = {
  request: {
    query: DELETE_POLL,
    variables: { deleteWaPollId: '1' },
  },
  result: {
    data: {
      deleteWaPoll: {
        errors: null,
        waPoll: null,
      },
    },
  },
};

export const WaPollListMocks = [
  filterRolesQuery,
  listPollsQuery,
  listPollsQuery,
  countPollsQuery,
  countPollsQuery,
  getPoll,
  deletePollQuery,
];
export const WaPollMocks = [filterRolesQuery, createPoll, getPoll, copyPoll];
