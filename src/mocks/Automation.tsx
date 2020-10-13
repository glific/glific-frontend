import { GET_AUTOMATION, GET_AUTOMATION_NAME } from '../graphql/queries/Automation';
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
          uuid: 'b050c652-65b5-4ccf-b62b-1e8b3f328676',
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
          uuid: 'b050c652-65b5-4ccf-b62b-1e8b3f328676',
          keywords: ['help'],
          ignoreKeywords: false,
        },
      ],
    },
  },
};

export const getAutomationNameQuery = {
  request: {
    query: GET_AUTOMATION_NAME,
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
        },
      ],
    },
  },
};
