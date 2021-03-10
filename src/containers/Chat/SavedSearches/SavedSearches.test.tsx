import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import SavedSearches from './SavedSearches';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';

import { searchQuery } from '../ChatMessages/ChatMessages.test';

const cache = new InMemoryCache({ addTypename: false });
cache.writeQuery(searchQuery);

const client = new ApolloClient({
  cache,
  assumeImmutableResults: true,
});

describe('<SavedSearches />', () => {
  test('it should mount', () => {
    const { getByText } = render(
      <ApolloProvider client={client}>
        <SavedSearches />
      </ApolloProvider>
    );

    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();
    // const savedSearches = screen.getByTestId('SavedSearches');

    // expect(savedSearches).toBeInTheDocument();
  });
});
