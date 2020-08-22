import React from 'react';
import { shallow } from 'enzyme';
import { render, wait } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import { Collection } from './Collection';
import { LIST_ITEM_MOCKS } from './Collection.test.helper';

const mocks = LIST_ITEM_MOCKS;

const wrapper = shallow(
  <MockedProvider mocks={mocks} addTypename={false}>
    <Collection />
  </MockedProvider>
);

describe('<Collection />', () => {
  it('should render Collection', () => {
    expect(wrapper.exists()).toBe(true);
  });
});

test('should load the collection edit', async () => {
  const { getByText } = render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <Collection match={{ params: { id: 1 } }} />
    </MockedProvider>
  );

  await wait();
  expect(getByText('Edit Collection')).toBeInTheDocument();
});
