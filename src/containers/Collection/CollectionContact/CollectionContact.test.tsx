import { render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router';
import { vi } from 'vitest';

import { countCollectionContactsQuery, getCollectionContactsQuery } from 'mocks/Contact';
import { getCollectionQuery } from 'mocks/Collection';
import { CollectionContact } from './CollectionContact';

vi.mock('react-router-dom', async () => {
  return {
    ...(await vi.importActual<any>('react-router-dom')),
    useParams: () => ({ id: 1 }),
  };
});

const mocks = [
  countCollectionContactsQuery,
  countCollectionContactsQuery,
  getCollectionQuery,
  getCollectionQuery,
  getCollectionContactsQuery
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
    const { getByText } = render(wrapper);

    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(getByText('Back to all collections')).toBeInTheDocument();
    });
  });
});
