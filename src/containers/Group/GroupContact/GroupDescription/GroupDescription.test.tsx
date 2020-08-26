import React from 'react';
import { shallow } from 'enzyme';
import { GroupDescription } from './GroupDescription';

const defaultProps = {
  users: [{ id: 1, name: 'Default User' }],
  description: 'Default group',
};

const wrapper = shallow(<GroupDescription {...defaultProps}></GroupDescription>);

it('should render GroupDescription', () => {
  expect(wrapper.exists()).toBe(true);
});
