import {
  CREATE_CATEGORY,
  DELETE_KNOWLEDGE_BASE,
  UPLOAD_KNOWLEDGE_BASE,
} from 'graphql/mutations/KnowledgeBase';
import { GET_CATEGORIES, GET_KNOWLEDGE_BASE } from 'graphql/queries/KnowledgeBase';

const getKnowledgeBase = {
  request: {
    query: GET_KNOWLEDGE_BASE,
    variables: { filter: {}, opts: { limit: 50, offset: 0, order: 'ASC', orderWith: undefined } },
  },
  result: {
    data: {
      knowledgeBases: [
        {
          __typename: 'KnowledgeBase',
          category: {
            __typename: 'Category',
            id: '1',
            name: 'Support',
            uuid: '3fa22108-f464-41e5-81d9-d8a298854429',
          },
          id: 'e3f282c4-278a-43b9-ac81-fc31dac8a749',
          name: 'Document1.pdf',
        },
        {
          __typename: 'KnowledgeBase',
          category: {
            __typename: 'Category',
            id: '2',
            name: 'Support',
            uuid: '3fa22108-f464-41e5-81d9-d8a298854429',
          },
          id: '5252b667-7289-4e06-95fd-0de66eea78ae',
          name: 'Document2.pdf',
        },
      ],
    },
  },
};

const deleteKnowledgeBase = {
  request: {
    query: DELETE_KNOWLEDGE_BASE,
    variables: { uuid: 'e3f282c4-278a-43b9-ac81-fc31dac8a749' },
  },
  result: {
    data: {
      deleteKnowledgeBase: {
        msg: 'Successfully Deleted',
      },
    },
  },
};

const getCategories = {
  request: {
    query: GET_CATEGORIES,
  },
  result: {
    data: {
      categories: [
        {
          __typename: 'Category',
          id: '1',
          name: 'Support',
          uuid: '3fa22108-f464-41e5-81d9-d8a298854429',
        },
        {
          __typename: 'Category',
          id: '2',
          name: 'Support',
          uuid: '3fa22108-f464-41e5-81d9-d8a298854429',
        },
      ],
    },
  },
};

const uploadKnowledgeBase = {
  request: {
    query: UPLOAD_KNOWLEDGE_BASE,
  },
  result: {
    data: {
      uploadKnowledgeBase: {
        msg: 'Successfully uploaded the file!',
      },
    },
  },
  variableMatcher: (variables: any) => true,
};

const createCategory = {
  request: {
    query: CREATE_CATEGORY,
    variables: {
      name: 'Support2',
    },
  },
  result: {
    data: {
      createCategory: {
        id: '2',
        name: 'Support2',
        uuid: '3fa22108-f464-41e5-81d9-d8a298854429',
      },
    },
  },
};

export const categoryMocks = [createCategory, getCategories, getCategories];

export const knowledgeBaseMocks = [
  getKnowledgeBase,
  getKnowledgeBase,
  getKnowledgeBase,
  deleteKnowledgeBase,
  getKnowledgeBase,
  getCategories,
  uploadKnowledgeBase,
  uploadKnowledgeBase,
];
