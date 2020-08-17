import React from 'react';
import { shallow } from 'enzyme';
import { Group } from './Group';

const wrapper = shallow(<Group match={{ params: { id: 1 } }} />);

it('should render Group', () => {
  expect(wrapper.exists()).toBe(true);
});
