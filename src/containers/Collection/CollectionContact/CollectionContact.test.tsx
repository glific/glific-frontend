import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router';

import { CollectionContact } from './CollectionContact';
import { countCollectionContactsQuery } from '../../../mocks/Contact';
import { getCollectionQuery } from '../../../mocks/Collection';

const mocks = [countCollectionContactsQuery, getCollectionQuery, getCollectionQuery];

const wrapper = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter>
      <CollectionContact match={{ params: { id: 1 } }} />
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
