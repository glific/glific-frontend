import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';

import SideMenus from './SideMenus';
import { getCurrentUserQuery } from '../../../../../mocks/User';

const mocks = [getCurrentUserQuery];
const cache = new InMemoryCache({ addTypename: false });
const client = new ApolloClient({
  cache: cache,
});

describe('side menu testing', () => {
  const component = (
    <MemoryRouter>
      <ApolloProvider client={client}>
        <SideMenus opened={false} />
      </ApolloProvider>
    </MemoryRouter>
  );

  it('it should be initialized properly', async () => {
    const { getByTestId } = render(component);
    expect(getByTestId('list')).toBeInTheDocument();
  });
});
