import { GET_ORGANIZATION_STATUS } from 'graphql/queries/Organization';
import { GET_WA_MANAGED_PHONES_STATUS } from 'graphql/queries/WaGroups';

export const orgSuspendedMock = {
  request: {
    query: GET_ORGANIZATION_STATUS,
  },
  result: {
    data: {
      organization: {
        __typename: 'OrganizationStatus',
        organization: {
          __typename: 'Organization',
          isSuspended: false,
        },
      },
    },
  },
};

export const getWhatsAppManagedPhonesStatusMock = {
  request: {
    query: GET_WA_MANAGED_PHONES_STATUS,
  },
  result: {
    data: {
      waManagedPhones: [
        {
          __typename: 'WaManagedPhone',
          phone: '918658048983',
          status: 'active',
        },
      ],
    },
  },
};

export const getInactiveStatusMock = {
  request: {
    query: GET_WA_MANAGED_PHONES_STATUS,
    variables: {},
  },
  result: {
    data: {
      waManagedPhones: [
        {
          __typename: 'WaManagedPhone',
          phone: '918658048983',
          status: 'inactive',
        },
      ],
    },
  },
};
