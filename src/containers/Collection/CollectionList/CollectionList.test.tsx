import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { CollectionList } from './CollectionList';
import { LIST_ITEM_MOCKS } from '../Collection.test.helper';

const mocks = LIST_ITEM_MOCKS;

const wrapper = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <CollectionList />
  </MockedProvider>
);

test('should load the collection list', async () => {
  const { getByText } = render(wrapper);

  // loading is show initially
  expect(getByText('Loading...')).toBeInTheDocument();
  await waitFor(()=>{
    expect(getByText('Collections')).toBeInTheDocument();
  });
 
});
