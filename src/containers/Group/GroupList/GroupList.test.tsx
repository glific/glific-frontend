import React from 'react';
import { shallow } from 'enzyme';
import { GroupList } from './GroupList';

const wrapper = shallow(<GroupList />);

it('should render GroupList', () => {
  expect(wrapper.exists()).toBe(true);
});
