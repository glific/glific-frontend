import React from 'react';
import { render } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { Search } from './Search';
import { LIST_ITEM_MOCKS } from './Search.test.helper';

const mocks = LIST_ITEM_MOCKS;

const wrapper = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Search match={{ params: { id: 1 } }} />
  </MockedProvider>
);

test('should load the collection edit', async () => {
  const { getByText, findByTestId } = render(wrapper);

  // loading is show initially
  expect(getByText('Loading...')).toBeInTheDocument();

  const formLayout = await findByTestId('formLayout');
  expect(formLayout).toHaveTextContent('Search');
});

test('should load the search', async () => {
  const wrapper = (
    <MockedProvider mocks={mocks} addTypename={false}>
      <Search
        match={{ params: { id: 1 }, type: 'search', search: Function, handleSave: Function }}
      />
    </MockedProvider>
  );
  const { getByText, findByTestId } = render(wrapper);

  // loading is show initially
  expect(getByText('Loading...')).toBeInTheDocument();

  const formLayout = await findByTestId('formLayout');
  expect(formLayout).toHaveTextContent('Search');
});

test('should load the save Search', async () => {
  const wrapper = (
    <MockedProvider mocks={mocks} addTypename={false}>
      <Search
        match={{ params: { id: 1 }, type: 'saveSearch', search: Function, handleSave: Function }}
      />
    </MockedProvider>
  );
  const { getByText, findByTestId } = render(wrapper);

  // loading is show initially
  expect(getByText('Loading...')).toBeInTheDocument();

  const formLayout = await findByTestId('formLayout');
  expect(formLayout).toHaveTextContent('Search');
});
