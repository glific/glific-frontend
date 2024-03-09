import { render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import { SearchList } from './SearchList';
import { LIST_ITEM_MOCKS } from '../Search.test.helper';
import { MemoryRouter } from 'react-router';

const mocks = LIST_ITEM_MOCKS;

const wrapper = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter>
      <SearchList />
    </MemoryRouter>
  </MockedProvider>
);

test('should load the collection list', async () => {
  const { getByText, getByTestId } = render(wrapper);

  // loading is show initially
  expect(getByTestId('loading')).toBeInTheDocument();
  await waitFor(() => {
    expect(getByText('Searches')).toBeInTheDocument();
  });
});
