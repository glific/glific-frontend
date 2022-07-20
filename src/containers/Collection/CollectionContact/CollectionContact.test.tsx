import { render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router';

import { countCollectionContactsQuery } from 'mocks/Contact';
import { getCollectionQuery } from 'mocks/Collection';
import { CollectionContact } from './CollectionContact';

jest.mock('react-router-dom', () => {
  return {
    ...jest.requireActual('react-router-dom'),
    useParams: () => ({ id: 1 }),
  };
});

const mocks = [
  countCollectionContactsQuery,
  countCollectionContactsQuery,
  getCollectionQuery,
  getCollectionQuery,
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
