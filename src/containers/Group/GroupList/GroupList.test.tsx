import React from 'react';
import { shallow } from 'enzyme';
import { GroupList } from './GroupList';
import { MockedProvider } from '@apollo/client/testing';

const wrapper = shallow(
  <MockedProvider>
    <GroupList />
  </MockedProvider>
);

it('should render GroupList', () => {
  expect(wrapper.exists()).toBe(true);
});
