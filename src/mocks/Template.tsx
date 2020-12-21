import { setVariables } from '../common/constants';
import { FILTER_TEMPLATES, GET_TEMPLATES_COUNT } from '../graphql/queries/Template';

export const filterTemplatesQuery = (term: any, data: any) => {
  return {
    request: {
      query: FILTER_TEMPLATES,
      variables: setVariables({ term: term }),
    },
    result: {
      data: {
        sessionTemplates: data,
      },
    },
  };
};

export const TEMPLATE_MOCKS = [
  filterTemplatesQuery('', [
    {
      id: '87',
      label: 'Good message',
      body: 'Hey there',
      isReserved: true,
      isActive: false,
      status: null,
      isHsm: true,
      updatedAt: '2020-12-01T18:00:32Z',
      translations: '{}',
      type: 'TEXT',
      language: {
        id: '1',
        label: 'Hindi',
      },
      MessageMedia: {
        id: 1,
        caption: 'Test',
        sourceUrl: 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__340.jpg',
      },
    },
    {
      id: '94',
      label: 'Message',
      body: 'some description',
      isReserved: true,
      isHsm: false,
      isActive: false,
      status: null,
      updatedAt: '2020-12-01T18:00:32Z',
      translations: '{}',
      type: 'TEXT',
      language: {
        id: '1',
        label: 'Hindi',
      },
      MessageMedia: {
        id: 1,
        caption: 'Test',
        sourceUrl: 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__340.jpg',
      },
    },
  ]),
  filterTemplatesQuery('', [
    {
      id: '87',
      label: 'Good message',
      body: 'Hey there',
      isReserved: true,
      isHsm: true,
      isActive: false,
      status: null,
      updatedAt: '2020-12-01T18:00:32Z',
      translations: '{}',
      type: 'TEXT',
      language: {
        id: '1',
        label: 'Hindi',
      },
      MessageMedia: {
        id: 1,
        caption: 'Test',
        sourceUrl: 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__340.jpg',
      },
    },
    {
      id: '94',
      label: 'Message',
      body: 'some description',
      isReserved: true,
      isHsm: false,
      isActive: false,
      status: null,
      updatedAt: '2020-12-01T18:00:32Z',
      translations: '{}',
      type: 'TEXT',
      language: {
        id: '1',
        label: 'Hindi',
      },
      MessageMedia: {
        id: 1,
        caption: 'Test',
        sourceUrl: 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__340.jpg',
      },
    },
  ]),

  filterTemplatesQuery('this should not return anything', []),
  filterTemplatesQuery('hi', [
    {
      id: '87',
      label: 'Good message',
      body: 'hi can you help!',
      isReserved: true,
      isHsm: true,
      isActive: false,
      status: null,
      updatedAt: '2020-12-01T18:00:32Z',
      translations: '{}',
      type: 'TEXT',
      language: {
        id: '1',
        label: 'Hindi',
      },
      MessageMedia: {
        id: 1,
        caption: 'Test',
        sourceUrl: 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__340.jpg',
      },
    },
  ]),
];

export const getHSMTemplateCountQuery = {
  request: {
    query: GET_TEMPLATES_COUNT,
    variables: {
      filter: {
        label: '',
        isHsm: true,
      },
    },
  },
  result: {
    data: {
      countSessionTemplates: 3,
    },
  },
};

export const getTemplateCountQuery = {
  request: {
    query: GET_TEMPLATES_COUNT,
    variables: {
      filter: {
        label: '',
        isHsm: false,
      },
    },
  },
  result: {
    data: {
      countSessionTemplates: 3,
    },
  },
};
