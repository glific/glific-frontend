import { render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router';
import { vi } from 'vitest';

import { GroupCollectionList } from './GroupCollectionList';
import { GET_GROUP_COUNT } from 'graphql/queries/WaGroups';
import { GET_COLLECTION, GROUP_GET_COLLECTION } from 'graphql/queries/Collection';
import { UPDATE_WA_GROUP_COLLECTION } from 'graphql/mutations/Collection';

const mocks = [
  {
    request: {
      query: GET_GROUP_COUNT,
      variables: { filter: { includeGroups: '1' } },
    },
    result: { data: { countWaGroups: 5 } },
  },
  {
    request: {
      query: GROUP_GET_COLLECTION,
      variables: {
        filter: { includeGroups: '1' },
        opts: { limit: 50, offset: 0, order: 'ASC', orderWith: 'label' },
      },
    },
    result: {
      data: {
        waGroups: [
          {
            bspId: '120363255034755395@g.us',
            id: '19',
            label: 'Group 12',
            lastCommunicationAt: '2024-03-14T05:31:46Z',
          },
          {
            bspId: '120363254553139323@g.us',
            id: '24',
            label: 'Group 7',
            lastCommunicationAt: '2024-03-14T03:57:42Z',
          },
          {
            bspId: '120363255430686472@g.us',
            id: '23',
            label: 'Group 8',
            lastCommunicationAt: '2024-03-14T03:57:42Z',
          },
          {
            bspId: '493920286032891462@g.us',
            id: '1',
            label: 'Indiana foes',
            lastCommunicationAt: '2024-03-14T03:55:33Z',
          },
          {
            bspId: '112887777270950553@g.us',
            id: '3',
            label: 'Oklahoma banshees',
            lastCommunicationAt: '2024-03-14T04:55:24Z',
          },
        ],
      },
    },
  },
  {
    request: {
      query: GET_COLLECTION,
      variables: { id: '1' },
    },
    result: {
      data: {
        group: {
          __typename: 'GroupResult',
          group: {
            __typename: 'Group',
            description: null,
            id: '2',
            label: 'Default WA Group Collection',
            roles: [],
            users: [],
          },
        },
      },
    },
  },
  {
    request: {
      query: UPDATE_WA_GROUP_COLLECTION,
      variables: {},
    },
    result: {},
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
    <MemoryRouter initialEntries={['/collection/1/groups']}>
      <GroupCollectionList />
    </MemoryRouter>
  </MockedProvider>
);

describe('<GroupCollectionList />', () => {
  test('should render Group label', async () => {
    const { getByTestId, getByText } = render(wrapper);

    expect(getByTestId('loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(getByText('Default WA Group Collection')).toBeInTheDocument();
    });
  });

  test('should render GroupCollectionList', async () => {
    const { getByTestId, getByText } = render(wrapper);

    expect(getByTestId('loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(getByText('Group 12')).toBeInTheDocument();
    });
  });
});
