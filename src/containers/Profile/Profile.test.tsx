import React from 'react';
import { shallow } from 'enzyme';
import { Profile } from './Profile';

const wrapper = shallow(<Profile match={{ params: { id: 1 } }} />);

it('should render Profile page', () => {
  expect(wrapper.exists()).toBe(true);
});
