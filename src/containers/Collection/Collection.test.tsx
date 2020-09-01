import React from 'react';

import { render } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import { Collection } from './Collection';
import { LIST_ITEM_MOCKS } from './Collection.test.helper';

const mocks = LIST_ITEM_MOCKS;

const wrapper = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Collection match={{ params: { id: 1 } }} />
  </MockedProvider>
);

test('should load the collection edit', async () => {
  const { getByText, findByTestId } = render(wrapper);

  // loading is show initially
  expect(getByText('Loading...')).toBeInTheDocument();

  const formLayout = await findByTestId('formLayout');
  expect(formLayout).toHaveTextContent('Collection');
});
