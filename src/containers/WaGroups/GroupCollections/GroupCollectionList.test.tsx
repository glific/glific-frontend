import { render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router';
import { vi } from 'vitest';

import { GroupCollectionList } from './GroupCollectionList';
import {
  countGroups,
  getGroups,
  getGroupsCollections,
  updateWaGroupCollection,
} from 'mocks/Groups';

const mocks = [
  countGroups,
  getGroups,
  getGroupsCollections,
  updateWaGroupCollection,
  countGroups,
  getGroups,
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
