import { MockedProvider } from '@apollo/client/testing';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import GroupDetails from './GroupDetails';
import { COUNT_COUNTACTS_WA_GROUPS, LIST_CONTACTS_WA_GROUPS } from 'graphql/queries/WaGroups';

const mocks = [
  {
    request: {
      query: LIST_CONTACTS_WA_GROUPS,
      variables: {
        filter: {
          waGroupId: '1',
        },
        opts: {
          limit: 50,
          offset: 0,
          order: 'ASC',
          orderWith: undefined,
        },
      },
    },
    result: {
      data: {
        waGroupContact: [
          {
            contact: {
              id: '18',
              name: 'User 1',
              phone: '918416933261',
              waGroups: [
                {
                  label: 'Random',
                },
                {
                  label: 'Group 7',
                },
                {
                  label: 'Group 3',
                },
              ],
            },
            id: '792',
            isAdmin: false,
            waGroup: {
              id: '20',
              label: 'Group 12',
              waManagedPhone: {
                phone: '918657048983',
              },
            },
          },
          {
            contact: {
              id: '16',
              name: null,
              phone: '918657048983',
              waGroups: [
                {
                  label: 'Maytapi Testing ',
                },
                {
                  label: 'Random2',
                },
              ],
            },
            id: '793',
            isAdmin: true,
            waGroup: {
              __typename: 'WaGroup',
              id: '20',
              label: 'Group 12',
              waManagedPhone: {
                __typename: 'WaManagedPhone',
                phone: '918657048983',
              },
            },
          },
        ],
      },
    },
  },
  {
    request: {
      query: COUNT_COUNTACTS_WA_GROUPS,
      variables: { filter: { waGroupId: '1' } },
    },
    result: {
      data: {
        countWaGroupContact: 2,
      },
    },
  },
];

vi.mock('react-router-dom', async () => {
  return {
    ...(await vi.importActual<any>('react-router-dom')),
    useParams: () => ({ id: '1' }),
  };
});

const wrapper = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter>
      <GroupDetails />
    </MemoryRouter>
  </MockedProvider>
);

test('should render Group details', async () => {
  const { getByTestId, getByText } = render(wrapper);

  expect(getByTestId('loading')).toBeInTheDocument();

  await waitFor(() => {
    expect(getByText('User 1')).toBeInTheDocument();
  });
});

test('should render admin tag for admins', async () => {
  const { getByTestId, getByText } = render(wrapper);

  expect(getByTestId('loading')).toBeInTheDocument();

  await waitFor(() => {
    expect(getByText('Admin')).toBeInTheDocument();
  });
});
