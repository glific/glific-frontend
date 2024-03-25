import {
  GET_FLOW,
  GET_FLOWS,
  GET_FLOW_COUNT,
  GET_FLOW_DETAILS,
  FILTER_FLOW,
  EXPORT_FLOW,
  RELEASE_FLOW,
  GET_FREE_FLOW,
  EXPORT_FLOW_LOCALIZATIONS,
} from 'graphql/queries/Flow';
import {
  ADD_FLOW_TO_CONTACT,
  ADD_FLOW_TO_COLLECTION,
  PUBLISH_FLOW,
  IMPORT_FLOW,
  RESET_FLOW_COUNT,
  UPDATE_FLOW,
  CREATE_FLOW_COPY,
  AUTO_TRANSLATE_FLOW,
  IMPORT_FLOW_LOCALIZATIONS,
  ADD_FLOW_TO_WA_GROUP,
  CREATE_FLOW,
} from 'graphql/mutations/Flow';
import { GET_ORGANIZATION_SERVICES } from 'graphql/queries/Organization';
import json from './ImportFlow.json';
import { GET_ALL_FLOW_LABELS } from 'graphql/queries/FlowLabel';
import { CREATE_LABEL } from 'graphql/mutations/Tags';

const flowData = {
  flow: {
    flow: {
      id: '1',
      name: 'Help',
      isActive: true,
      description: 'Help flow',
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
      tag: {
        id: '1',
        label: 'New tag',
      },
    },
  },
};

export const getFlowQuery = {
  request: {
    query: GET_FLOW,
    variables: {
      id: 1,
    },
  },
  result: {
    data: flowData,
  },
};

export const getFlowQuery2 = {
  request: {
    query: GET_FLOW,
    variables: {
      id: '1',
    },
  },
  result: {
    data: flowData,
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
    variables: { flowId: '1', groupId: '1' },
  },

  result: {
    data: {
      startGroupFlow: {
        success: true,
      },
    },
  },
};

export const addFlowToWAGroupQuery = {
  request: {
    query: ADD_FLOW_TO_WA_GROUP,
    variables: { flowId: '1', waGroupId: '1' },
  },

  result: {
    data: {
      startWaGroupFlow: { errors: null, success: true },
    },
  },
};

const filterFlowResult = {
  data: {
    flows: [
      {
        id: '1',
        ignoreKeywords: true,
        isActive: true,
        description: 'Help flow',
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
        tag: {
          id: '1',
          label: 'help',
        },
      },
      {
        description: null,
        id: '2',
        ignoreKeywords: false,
        isActive: true,
        isBackground: false,
        isPinned: false,
        keywords: ['preference'],
        lastChangedAt: null,
        lastPublishedAt: '2024-03-23T15:26:41.450940Z',
        name: 'Preference Workflow',
        roles: [],
        tag: null,
        updatedAt: '2024-03-23T15:26:41.447361Z',
        uuid: '63397051-789d-418d-9388-2ef7eb1268bb',
      },
      {
        description: null,
        id: '3',
        ignoreKeywords: true,
        isActive: true,
        isBackground: false,
        isPinned: false,
        keywords: ['optout', 'stop'],
        lastChangedAt: null,
        lastPublishedAt: '2024-03-23T15:26:40.635789Z',
        name: 'Optout Workflow',
        roles: [],
        tag: null,
        updatedAt: '2024-03-23T15:26:40.634989Z',
        uuid: '9e607fd5-232e-43c8-8fac-d8a99d72561e',
      },
    ],
  },
};

export const filterFlowQuery = {
  request: {
    query: FILTER_FLOW,
    variables: {
      filter: { isActive: true },
      opts: {
        limit: 50,
        offset: 0,
        order: 'DESC',
        orderWith: 'is_pinned',
      },
    },
  },

  result: filterFlowResult,
};

export const filterFlowSortQuery = {
  request: {
    query: FILTER_FLOW,
    variables: {
      filter: { isActive: true },
      opts: {
        limit: 50,
        offset: 0,
        order: 'DESC',
        orderWith: 'name',
      },
    },
  },

  result: filterFlowResult,
};

export const filterFlowWithNameOrKeywordOrTagQuery = {
  request: {
    query: FILTER_FLOW,
    variables: {
      filter: { name_or_keyword_or_tags: 'help', isActive: true },
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
          description: 'Help flow',
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
      filter: { isActive: true },
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
      filter: { name_or_keyword_or_tags: 'help', isActive: true },
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
      filter: { status: 'published', isActive: true },
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
        {
          id: '2',
          name: 'AB Test Workflow',
          uuid: '5f3fd8c6-2ec3-4945-8e7c-314db8c04c31',
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
        success: null,
      },
    },
  },
};

export const getOrganizationServicesQuery = {
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
        status: {
          flowName: 'flow 1',
          status: 'success',
        },
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
        success: true,
        errors: [],
      },
    },
  },
};

export const updateFlowQuery = {
  request: {
    query: UPDATE_FLOW,
    variables: {
      id: '1',
      input: {
        isActive: true,
        isPinned: false,
        isBackground: false,
        name: 'Help',
        keywords: ['help'],
        description: 'Help flow',
        ignoreKeywords: false,
        addRoleIds: [],
        deleteRoleIds: [],
        tag_id: '1',
      },
    },
  },
  result: {
    data: {
      updateFlow: {
        flow: {
          roles: null,
          tag: null,
          id: '1',
          isActive: true,
          ignoreKeywords: false,
          description: 'Help flow',
          keywords: ['मदद'],
          name: 'New Flow',
          isBackground: false,
          updatedAt: '2021-03-05T04:32:23Z',
          uuid: '3fa22108-f464-41e5-81d9-d8a298854429',
          isPinned: false,
        },

        errors: null,
      },
    },
  },
};

export const updateFlowQueryWithError = {
  request: {
    query: UPDATE_FLOW,
    variables: {
      id: '1',
      input: {
        isActive: true,
        isPinned: false,
        isBackground: false,
        name: 'Help',
        keywords: ['help'],
        description: 'Help flow',
        ignoreKeywords: false,
        addRoleIds: [],
        deleteRoleIds: [],
        tag_id: '1',
      },
    },
  },
  result: {
    data: {
      updateFlow: {
        errors: [
          {
            key: 'keywords',
            message: 'Keywords: The keyword `help` was already used in the `Help Workflow` Flow.',
          },
        ],
        flow: null,
      },
    },
  },
};

export const getFlowTranslations = {
  request: {
    query: AUTO_TRANSLATE_FLOW,
    variables: { id: '1' },
  },
  result: {
    data: {
      inlineFlowLocalization: {
        success: true,
        errors: [],
      },
    },
  },
};

export const getFlowTranslationsWithErrors = {
  request: {
    query: AUTO_TRANSLATE_FLOW,
    variables: { id: '1' },
  },
  result: {
    data: {
      inlineFlowLocalization: {
        success: false,
        errors: [{ key: 'error', message: 'Sorry! Unable to translate flow' }],
      },
    },
  },
};

export const importFlowTranslationsMock = {
  request: {
    query: IMPORT_FLOW_LOCALIZATIONS,
    variables: {
      localization:
        'Type,UUID,en,hi\nType,UUID,English,Hindi\naction,6e3ce9b0-f4a0-4a9d-a182-02647cdbcc80,No worries. You can always change that by sending us *help*.,चिंता न करें। आप हमेशा मदद मेनू में जाकर उसे बदल सकते हैं। आप अभी भी हमें कभी भी मैसेज कर सकते हैं।\naction,852fc451-7482-4c09-b3c6-55cad8546b6b,Thank you for giving us the permission. We really appreciate it.,हमें अनुमति देने के लिए धन्यवाद। हम वास्तव में इसकी बहुत सराहना करते हैं।\n',
      id: '1',
    },
  },
  result: {
    data: {
      importFlowLocalization: {
        success: true,
      },
    },
  },
};

export const exportFlowTranslationsMock = (autoTranslate: boolean) => ({
  request: {
    query: EXPORT_FLOW_LOCALIZATIONS,
    variables: { id: '1', addTranslation: autoTranslate },
  },
  result: {
    data: {
      exportFlowLocalization: {
        exportData:
          'Type,UUID,en,hi\nType,UUID,English,Hindi\naction,6e3ce9b0-f4a0-4a9d-a182-02647cdbcc80,No worries. You can always change that by sending us *help*.,चिंता न करें। आप हमेशा मदद मेनू में जाकर उसे बदल सकते हैं। आप अभी भी हमें कभी भी मैसेज कर सकते हैं।\naction,852fc451-7482-4c09-b3c6-55cad8546b6b,Thank you for giving us the permission. We really appreciate it.,हमें अनुमति देने के लिए धन्यवाद। हम वास्तव में इसकी बहुत सराहना करते हैं।\n',
      },
    },
  },
});

export const exportFlowTranslationsWithErrors = {
  request: {
    query: EXPORT_FLOW_LOCALIZATIONS,
    variables: { id: '1', addTranslation: false },
  },
  result: {
    data: null,
    errors: [
      {
        key: 'error',
        message: 'An error occured',
      },
    ],
  },
};

export const copyFlowQuery = {
  request: {
    query: CREATE_FLOW_COPY,
    variables: {
      id: '1',
      input: {
        isActive: true,
        isPinned: false,
        isBackground: false,
        name: 'Copy of Help',
        keywords: ['help', 'activity'],
        description: 'Help flow',
        ignoreKeywords: false,
        addRoleIds: [],
        deleteRoleIds: [],
        tag_id: '1',
      },
    },
  },
  result: {
    data: {
      copyFlow: {
        flow: {
          roles: [],
          tag: { id: '1', label: 'New tag' },
          id: '1',
          isActive: true,
          keywords: ['help', 'activity'],
          description: 'Help flow',
          name: 'Copy of Help',
          isBackground: false,
          updatedAt: '2021-03-05T04:32:23Z',
          uuid: '3fa22108-f464-41e5-81d9-d8a298854429',
          isPinned: false,
        },

        errors: null,
      },
    },
  },
};

export const createFlowQuery = {
  request: {
    query: CREATE_FLOW,
    variables: {
      input: {
        isActive: true,
        isPinned: false,
        isBackground: false,
        name: 'New Flow',
        keywords: ['मदद'],
        description: '',
        ignoreKeywords: false,
        addRoleIds: [],
        deleteRoleIds: [],
      },
    },
    result: {
      data: {
        createFlow: {
          errors: null,
          flow: {
            description: '',
            id: '4',
            isActive: true,
            name: 'New Flow',
            roles: [],
            uuid: 'c18190b4-5f14-47f3-acfd-c301e5edf3a0',
          },
        },
      },
    },
  },
};

export const getAllFlowLabelsQuery = {
  request: {
    query: GET_ALL_FLOW_LABELS,
    variables: { filter: {}, opts: { limit: null, offset: 0, order: 'ASC' } },
  },
  result: {
    data: {
      flowLabels: [
        {
          id: '1',
          name: 'dob',
        },
      ],
    },
  },
};

export const createTagQuery = {
  request: {
    query: CREATE_LABEL,
    variables: { input: { label: 'test', languageId: '1' } },
  },
  result: {
    data: {
      createTag: {
        errors: null,
        tag: {
          id: '4',
          label: 'test',
        },
      },
    },
  },
};
