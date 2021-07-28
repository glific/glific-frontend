import {
  GET_CONSULTING_HOURS,
  GET_CONSULTING_HOURS_COUNT,
  GET_CONSULTING_HOURS_BY_ID,
} from 'graphql/queries/Consulting';
import { FILTER_ORGANIZATIONS } from 'graphql/queries/Organization';

const mockListDummyData = new Array(10).fill(null).map((val: any, index: number) => ({
  id: `${index}`,
  content: 'Testing',
  isBillable: index % 2 === 0,
  duration: 30,
  insertedAt: '2021-05-13T05:17:31Z',
  participants: 'John Doe',
  staff: `Glific${index}`,
  organizationName: 'Foogle',
  updatedAt: '2021-05-13T05:35:51Z',
  when: '2021-05-06T10:30:00Z',
}));

export const listingMock = [
  {
    request: {
      query: GET_CONSULTING_HOURS_COUNT,
      variables: { filter: {} },
    },
    result: {
      data: {
        countConsultingHours: 10,
      },
    },
  },
  {
    request: {
      query: GET_CONSULTING_HOURS,
      variables: {
        filter: {},
        opts: {
          limit: 50,
          offset: 0,
          order: 'ASC',
          orderWith: 'organization_name',
        },
      },
    },
    result: {
      data: {
        consultingHours: mockListDummyData,
      },
    },
  },
];

export const getConsultingHour = {
  request: {
    query: GET_CONSULTING_HOURS_BY_ID,
    variables: { id: '0' },
  },
  result: {
    data: {
      consultingHour: {
        id: '0',
        content: 'Testing',
        isBillable: true,
        duration: 30,
        insertedAt: '2021-05-13T05:17:31Z',
        participants: 'John Doe',
        staff: `Gfific team`,
        organizationName: 'Foogle',
        updatedAt: '2021-05-13T05:35:51Z',
        when: '2021-05-06T10:30:00Z',
      },
    },
  },
};

export const getOrganizationList = {
  request: {
    query: FILTER_ORGANIZATIONS,
    variables: {
      filter: {},
      opts: {
        limit: null,
        offset: 0,
        order: 'ASC',
      },
    },
  },
  result: {
    data: {
      organizations: [
        {
          id: '2',
          insertedAt: '2021-04-28T05:19:51Z',
          status: 'ACTIVE',
          name: 'Foogle',
        },
        {
          id: '1',
          insertedAt: '2021-04-28T05:06:30Z',
          status: 'ACTIVE',
          name: 'Glific',
        },
        {
          id: '3',
          insertedAt: '2021-04-28T05:06:30Z',
          status: 'INACTIVE',
          name: 'Test',
        },
      ],
    },
  },
};
