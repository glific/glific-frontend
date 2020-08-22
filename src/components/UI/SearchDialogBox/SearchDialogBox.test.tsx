import React from 'react';

import { mount } from 'enzyme';
import { MockedProvider } from '@apollo/client/testing';
import { SearchDialogBox } from './SearchDialogBox';

const defaultProps = {
  title: 'Search Box',
  handleOk: jest.fn(),
  handleCancel: jest.fn(),
  options: [{ id: 1, label: 'something' }],
  selectedOptions: ['1'],
};
const wrapper = mount(
  <MockedProvider>
    <SearchDialogBox {...defaultProps} />
  </MockedProvider>
);

test('it should render the title correctly', () => {
  expect(wrapper.find('div[data-testid="dialogTitle"]').text()).toEqual('Search Box');
});

test('it should contain the selected option', () => {
  expect(wrapper.find('div[data-testid="searchChip"] span').text()).toEqual('something');
});
