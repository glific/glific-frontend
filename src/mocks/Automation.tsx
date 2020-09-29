import { GET_AUTOMATION } from '../graphql/queries/Automation';
import { FILTER_AUTOMATION } from '../graphql/queries/Automation';

export const getAutomationQuery = {
  request: {
    query: GET_AUTOMATION,
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
          uuid: '3838bjfbvjdbv93',
          keywords: ['help'],
          ignoreKeywords: false,
        },
      },
    },
  },
};

export const filterAutomationQuery = {
  request: {
    query: FILTER_AUTOMATION,
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
          uuid: 'dnidsini999ewi2b',
          keywords: ['help'],
          ignoreKeywords: false,
        },
      ],
    },
  },
};
