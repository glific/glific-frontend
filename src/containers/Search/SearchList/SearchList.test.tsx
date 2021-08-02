import { render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import { SearchList } from './SearchList';
import { LIST_ITEM_MOCKS } from '../Search.test.helper';

const mocks = LIST_ITEM_MOCKS;

const wrapper = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <SearchList />
  </MockedProvider>
);

test('should load the collection list', async () => {
  const { getByText } = render(wrapper);

  // loading is show initially
  expect(getByText('Loading...')).toBeInTheDocument();
  await waitFor(() => {
    expect(getByText('Searches')).toBeInTheDocument();
  });
});
