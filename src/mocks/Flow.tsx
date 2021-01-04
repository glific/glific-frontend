import { GET_FLOW, GET_FLOWS, GET_FLOW_COUNT, GET_FLOW_DETAILS } from '../graphql/queries/Flow';
import { FILTER_FLOW } from '../graphql/queries/Flow';

export const getFlowQuery = {
  request: {
    query: GET_FLOW,
    variables: {
      id: 1,
    },
  },

  result: {
    data: {
      flow: {
        flow: {
          id: '1',
          name: 'Help',
          uuid: 'b050c652-65b5-4ccf-b62b-1e8b3f328676',
          keywords: ['help'],
          ignoreKeywords: false,
        },
      },
    },
  },
};

export const filterFlowQuery = {
  request: {
    query: FILTER_FLOW,
    variables: {
      filter: {
        keyword: 'help',
      },
      opts: {
        order: 'ASC',
        limit: null,
        offset: 0,
      },
    },
  },

  result: {
    data: {
      flows: [
        {
          id: '1',
          name: 'help workflow',
          uuid: 'b050c652-65b5-4ccf-b62b-1e8b3f328676',
          keywords: ['help'],
          ignoreKeywords: false,
        },
      ],
    },
  },
};

export const getFlowDetailsQuery = {
  request: {
    query: GET_FLOW_DETAILS,
    variables: {
      filter: {
        uuid: 'b050c652-65b5-4ccf-b62b-1e8b3f328676',
      },
      opts: {},
    },
  },

  result: {
    data: {
      flows: [
        {
          name: 'help workflow',
          keywords: ['help'],
        },
      ],
    },
  },
};

export const getFlowCountQuery = {
  request: {
    query: GET_FLOW_COUNT,
    variables: {
      filter: {},
    },
  },

  result: {
    data: {
      countFlows: 3,
    },
  },
};

export const getPublishedFlowQuery = {
  request: {
    query: GET_FLOWS,
    variables: {
      filter: { status: 'published' },
      opts: {
        order: 'ASC',
        limit: null,
        offset: 0,
      },
    },
  },

  result: {
    data: {
      flows: [
        {
          id: '1',
          name: 'help workflow',
          uuid: 'b050c652-65b5-4ccf-b62b-1e8b3f328676',
        },
      ],
    },
  },
};
