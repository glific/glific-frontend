import { FILTER_TEMPLATES } from '../../../../graphql/queries/Template';

export const TEMPLATE_MOCKS = [
  {
    request: {
      query: FILTER_TEMPLATES,
      variables: {
        filter: {
          body: '',
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
          body: 'this should not return anything',
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
];
