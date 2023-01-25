import {
  GET_FLOW,
  GET_FLOWS,
  GET_FLOW_COUNT,
  GET_FLOW_DETAILS,
  FILTER_FLOW,
  EXPORT_FLOW,
  RELEASE_FLOW,
  GET_FREE_FLOW,
} from 'graphql/queries/Flow';
import {
  ADD_FLOW_TO_CONTACT,
  ADD_FLOW_TO_COLLECTION,
  PUBLISH_FLOW,
  IMPORT_FLOW,
  RESET_FLOW_COUNT,
} from 'graphql/mutations/Flow';
import { GET_ORGANIZATION_SERVICES } from 'graphql/queries/Organization';
import json from './ImportFlow.json';

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
          isActive: true,
          uuid: 'b050c652-65b5-4ccf-b62b-1e8b3f328676',
          keywords: ['help'],
          isPinned: false,
          roles: [
            {
              id: '1',
              label: 'Admin',
            },
          ],
          isBackground: false,
          ignoreKeywords: false,
        },
      },
    },
  },
};

export const addFlowToContactQuery = {
  request: {
    query: ADD_FLOW_TO_CONTACT,
    variables: {
      contactId: '1',
      flowId: '1',
    },
  },

  result: {
    data: {
      startContactFlow: {
        success: true,
      },
    },
  },
};

export const addFlowToCollectionQuery = {
  request: {
    query: ADD_FLOW_TO_COLLECTION,
    variables: {
      flowId: '',
      groupId: '2',
    },
  },

  result: {
    data: {
      startGroupFlow: {
        success: true,
      },
    },
  },
};

export const filterFlowQuery = {
  request: {
    query: FILTER_FLOW,
    variables: {
      filter: {},
      opts: {
        limit: 50,
        offset: 0,
        order: 'DESC',
        orderWith: 'is_pinned',
      },
    },
  },

  result: {
    data: {
      flows: [
        {
          id: '1',
          ignoreKeywords: true,
          isActive: true,
          keywords: ['help', 'मदद'],
          lastChangedAt: '2021-03-05T04:32:23Z',
          lastPublishedAt: null,
          name: 'Help Workflow',
          isBackground: false,
          updatedAt: '2021-03-05T04:32:23Z',
          uuid: '3fa22108-f464-41e5-81d9-d8a298854429',
          isPinned: true,
          roles: [
            {
              id: '1',
              label: 'Admin',
            },
          ],
        },
      ],
    },
  },
};

export const filterFlowWithNameOrKeywordQuery = {
  request: {
    query: FILTER_FLOW,
    variables: {
      filter: { nameOrKeyword: 'help' },
      opts: {
        limit: 50,
        offset: 0,
        order: 'DESC',
        orderWith: 'is_pinned',
      },
    },
  },

  result: {
    data: {
      flows: [
        {
          id: '1',
          ignoreKeywords: true,
          isActive: true,
          keywords: ['help', 'मदद'],
          lastChangedAt: '2021-03-05T04:32:23Z',
          lastPublishedAt: null,
          name: 'Help Workflow',
          isBackground: false,
          updatedAt: '2021-03-05T04:32:23Z',
          uuid: '3fa22108-f464-41e5-81d9-d8a298854429',
          isPinned: true,
          roles: [
            {
              id: '1',
              label: 'Admin',
            },
          ],
        },
      ],
    },
  },
};

const getFlowDetails = (isActive = true, keywords = ['help']) => ({
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
          id: '1',
          isActive,
          name: 'help workflow',
          keywords,
        },
      ],
    },
  },
});

export const getActiveFlow = getFlowDetails();
export const getInactiveFlow = getFlowDetails(false);
export const getFlowWithoutKeyword = getFlowDetails(true, []);

export const getFlowCountQuery = {
  request: {
    query: GET_FLOW_COUNT,
    variables: {
      filter: {},
    },
  },

  result: {
    data: {
      countFlows: 1,
    },
  },
};

export const getFlowCountWithFilterQuery = {
  request: {
    query: GET_FLOW_COUNT,
    variables: {
      filter: { nameOrKeyword: 'help' },
    },
  },
  result: {
    data: {
      countFlows: 1,
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
          name: 'Help Workflow',
          uuid: '3fa22108-f464-41e5-81d9-d8a298854429',
        },
      ],
    },
  },
};

export const filterFlowNewQuery = {
  request: {
    query: FILTER_FLOW,
    variables: {
      filter: { name: 'Help Workflow' },
      opts: {
        limit: 50,
        offset: 0,
        order: 'DESC',
        orderWith: 'is_pinned',
      },
    },
  },

  result: {
    data: {
      flows: [
        {
          id: '1',
          ignoreKeywords: true,
          keywords: ['help', 'मदद'],
          name: 'Help Workflow',
          isBackground: false,
          updatedAt: '2021-03-05T04:32:23Z',
          uuid: '3fa22108-f464-41e5-81d9-d8a298854429',
          isPinned: true,
        },
      ],
    },
  },
};

export const getFlowCountNewQuery = {
  request: {
    query: GET_FLOW_COUNT,
    variables: {
      filter: { name: 'Help Workflow' },
    },
  },

  result: {
    data: {
      countFlows: 1,
    },
  },
};

export const publishFlow = {
  request: {
    query: PUBLISH_FLOW,
    variables: {
      uuid: 'b050c652-65b5-4ccf-b62b-1e8b3f328676',
    },
  },
  result: {
    data: {
      publishFlow: {
        errors: [{ message: 'Something went wrong' }],
      },
    },
  },
};

export const getOrganisationServicesQuery = {
  request: {
    query: GET_ORGANIZATION_SERVICES,
  },
  result: {
    data: {
      organizationServices: {
        dialogflow: false,
        googleCloudStorage: true,
      },
    },
  },
};

export const importFlow = {
  request: {
    query: IMPORT_FLOW,
    variables: {
      flow: JSON.stringify(json),
    },
  },
  result: {
    data: {
      importFlow: {
        errors: null,
        success: true,
      },
    },
  },
};

export const exportFlow = {
  request: {
    query: EXPORT_FLOW,
    variables: { id: '1' },
  },
  result: {
    data: {
      exportFlow: {
        exportData: JSON.stringify(json),
      },
    },
  },
};

export const releaseFlow = {
  request: {
    query: RELEASE_FLOW,
  },
  result: {
    data: {
      flowRelease: {
        id: '1',
        uuid: '3fa22108-f464-41e5-81d9-d8a298854429',
      },
    },
  },
};

export const getFreeFlow = {
  request: {
    query: GET_FREE_FLOW,
    variables: { id: '1' },
  },
  result: {
    data: {
      flowGet: {
        flow: null,
        errors: [
          {
            key: 'error',
            message: 'The flow is being edited by NGO Main Account',
          },
        ],
      },
    },
  },
};

export const resetFlowCount = {
  request: {
    query: RESET_FLOW_COUNT,
    variables: { flowId: '1' },
  },
  result: {
    data: {
      resetFlowCount: {
        status: 'success',
        errors: [],
      },
    },
  },
};
