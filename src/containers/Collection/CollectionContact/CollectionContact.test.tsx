import { render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router';
import { vi } from 'vitest';

import { countCollectionContactsQuery, getCollectionContactsQuery } from 'mocks/Contact';
import { getCollectionInfo, getCollectionQuery, getCollectionUsersQuery } from 'mocks/Collection';
import { CollectionContact } from './CollectionContact';

vi.mock('react-router-dom', async () => {
  return {
    ...(await vi.importActual<any>('react-router-dom')),
    useParams: () => ({ id: '1' }),
  };
});

const mocks = [
  countCollectionContactsQuery,
  countCollectionContactsQuery,
  getCollectionQuery,
  getCollectionQuery,
  getCollectionInfo({ id: '1' }),
  getCollectionUsersQuery,
  getCollectionContactsQuery,
  getCollectionContactsQuery,
];

const wrapper = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter>
      <CollectionContact />
    </MemoryRouter>
  </MockedProvider>
);

describe('<CollectionContact />', () => {
  test('should render CollectionContact', async () => {
    const { getByTestId, getByText } = render(wrapper);
    // loading is show initially
    expect(getByTestId('loading')).toBeInTheDocument();
    await waitFor(() => {
      expect(getByText('Collection')).toBeInTheDocument();
    });
  });
});
