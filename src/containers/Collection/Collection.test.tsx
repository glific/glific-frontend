import React from 'react';
import { shallow } from 'enzyme';
import { Collection } from './Collection';
import { ApolloProvider } from '@apollo/client';
import gqlClient from '../../config/apolloclient';
import { render, wait, within, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { Route } from 'react-router-dom';
import { CollectionList } from './CollectionList/CollectionList';
import { LIST_ITEM_MOCKS } from './Collection.test.helper';

const mocks = LIST_ITEM_MOCKS;

const wrapper = shallow(
  <ApolloProvider client={gqlClient(null)}>
    <Collection />
  </ApolloProvider>
);

describe('<Collection />', () => {
  it('should render Collection', () => {
    expect(wrapper.exists()).toBe(true);
  });
});

test('cancel button should redirect to collectionlist page', async () => {
  const { container, getByText, unmount } = render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <Router>
        <Collection match={{ params: { id: 1 } }} />
        <Route path="/collection" exact component={CollectionList} />
      </Router>
    </MockedProvider>
  );
  await wait();
  const { queryByText } = within(container.querySelector('form'));
  const button = queryByText('Cancel');

  fireEvent.click(button);
  expect(getByText('Loading...')).toBeInTheDocument();
  await wait();
  expect(getByText('Collections')).toBeInTheDocument();
  unmount();
});
