import { FILTER_TEMPLATES } from '../../../../graphql/queries/Template';

export const TEMPLATE_MOCKS = [
  {
    request: {
      query: FILTER_TEMPLATES,
      variables: {
        filter: {
          term: '',
        },
        opts: {
          order: 'ASC',
        },
      },
    },
    result: {
      data: {
        sessionTemplates: [
          {
            id: '87',
            label: 'Good message',
            body: 'Hey there',
            isReserved: true,
            isHsm: true,
          },
          {
            id: '94',
            label: 'Message',
            body: 'some description',
            isReserved: true,
            isHsm: false,
          },
        ],
      },
    },
  },
  {
    request: {
      query: FILTER_TEMPLATES,
      variables: {
        filter: {
          term: 'this should not return anything',
        },
        opts: {
          order: 'ASC',
        },
      },
    },
    result: {
      data: {
        sessionTemplates: [],
      },
    },
  },
  {
    request: {
      query: FILTER_TEMPLATES,
      variables: {
        filter: {
          term: 'hi',
        },
        opts: {
          order: 'ASC',
        },
      },
    },
    result: {
      data: {
        sessionTemplates: [
          {
            id: '87',
            label: 'Good message',
            body: 'hi can you help!',
            isReserved: true,
            isHsm: true,
          },
        ],
      },
    },
  },
];
