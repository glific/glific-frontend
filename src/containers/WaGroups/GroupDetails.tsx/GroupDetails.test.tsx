import { MockedProvider } from '@apollo/client/testing';
import { render, waitFor } from '@testing-library/react';
import { CONTACT_SEARCH_QUERY, GET_CONTACT_COUNT } from 'graphql/queries/Contact';
import { MemoryRouter } from 'react-router';
import GroupDetails from './GroupDetails';

const mocks = [
  {
    request: {
      query: CONTACT_SEARCH_QUERY,
      variables: {
        filter: { includeWaGroups: '1' },
        opts: {
          limit: 50,
          offset: 0,
          order: 'ASC',
          orderWith: 'name',
        },
      },
    },
    result: {
      data: {
        contacts: [
          {
            groups: [],
            id: '21',
            maskedPhone: '9185******17',
            name: 'Default reciever',
            phone: '918547689517',
            status: 'VALID',
          },
          {
            groups: [],
            id: '22',
            maskedPhone: '9185******17',
            name: null,
            phone: '918547689517',
            status: 'VALID',
          },
          {
            groups: [],
            id: '23',
            maskedPhone: '9185******17',
            name: null,
            phone: '918547689517',
            status: 'VALID',
          },
        ],
      },
    },
  },
  {
    request: {
      query: GET_CONTACT_COUNT,
      variables: { filter: { includeWaGroups: '1' } },
    },
    result: {
      data: {
        countContacts: 3,
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
    expect(getByText('Default reciever')).toBeInTheDocument();
  });
});
