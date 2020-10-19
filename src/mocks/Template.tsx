import { setVariables } from '../common/constants';
import { FILTER_TEMPLATES } from '../graphql/queries/Template';

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
      isHsm: true,
    },
    {
      id: '94',
      label: 'Message',
      body: 'some description',
      isReserved: true,
      isHsm: false,
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
    },
  ]),
];
