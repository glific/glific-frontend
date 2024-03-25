import {
  GET_CONSULTING_HOURS,
  GET_CONSULTING_HOURS_COUNT,
  GET_CONSULTING_HOURS_BY_ID,
  EXPORT_CONSULTING_HOURS,
} from 'graphql/queries/Consulting';
import { CREATE_CONSULTING_HOUR, UPDATE_CONSULTING_HOURS } from 'graphql/mutations/Consulting';
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

export const getConsultingHour = {
  request: {
    query: GET_CONSULTING_HOURS_BY_ID,
    variables: { id: '1' },
  },
  result: {
    data: {
      consultingHour: {
        consultingHour: {
          content: 'test',
          duration: 15,
          id: '1',
          insertedAt: '2021-08-04T14:13:24Z',
          isBillable: false,
          organizationName: 'Glific',
          participants: 'John Doe',
          staff: 'Glific test',
          updatedAt: '2021-08-04T14:16:01Z',
          when: '2021-08-04T14:13:09Z',
        },
      },
    },
  },
};

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
          order: 'DESC',
          orderWith: 'when',
        },
      },
    },
    result: {
      data: {
        consultingHours: mockListDummyData,
      },
    },
  },
  getOrganizationList,
  getConsultingHour,
];

export const createConsultingHour = {
  request: {
    query: CREATE_CONSULTING_HOUR,
    variables: {
      input: {
        clientId: 1,
        content: 'test',
        duration: 15,
        isBillable: false,
        organizationName: 'Glific',
        participants: 'John Doe',
        staff: 'Glific staff',
        when: '2021-08-04T14:13:09.784Z',
      },
    },
  },
  result: {
    data: {
      createConsultingHour: {
        consultingHour: {
          content: 'test',
          duration: 15,
          insertedAt: '2021-08-04T14:13:24Z',
          isBillable: false,
          organizationName: 'Glific',
          participants: 'John Doe',
          staff: 'Glific staff',
          updatedAt: '2021-08-04T14:13:24Z',
          when: '2021-08-04T14:13:09Z',
        },
        errors: null,
      },
    },
  },
};

export const updateConsultingHour = {
  request: {
    query: UPDATE_CONSULTING_HOURS,
    variables: {
      id: '1',
      input: {
        clientId: 1,
        content: 'test',
        duration: 15,
        isBillable: false,
        organizationName: 'Glific',
        participants: 'John Doe',
        staff: 'Glific staff',
        when: '2021-08-04T14:13:09.784Z',
      },
    },
  },
  result: {
    data: {
      updateConsultingHour: {
        consultingHour: {
          content: 'test',
          duration: 15,
          insertedAt: '2021-08-04T14:13:24Z',
          isBillable: false,
          organizationName: 'Glific',
          participants: 'John Doe',
          staff: 'Glific staff',
          updatedAt: '2021-08-04T14:13:24Z',
          when: '2021-08-04T14:13:09Z',
        },
        errors: null,
      },
    },
  },
};

export const exportConsulting = {
  request: {
    query: EXPORT_CONSULTING_HOURS,
    variables: { filter: { clientId: '2', startDate: '2020-09-03', endDate: '2020-09-04' } },
  },
  result: {
    data: {
      fetchConsultingHours: {},
    },
  },
};
