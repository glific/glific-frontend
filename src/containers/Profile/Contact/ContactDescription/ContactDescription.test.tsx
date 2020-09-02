import React from 'react';
import { shallow } from 'enzyme';
import { ContactDescription } from './ContactDescription';

const date = new Date();
const defaultProps = {
  fields: {},
  phoneNo: '9987399299',
  groups: [{ id: 1, label: 'Default Group' }],
  lastMessage: date.toString(),
};

const wrapper = shallow(<ContactDescription {...defaultProps}></ContactDescription>);

it('should render ContactDescription', () => {
  expect(wrapper.exists()).toBe(true);
});

test('it should display contact number', () => {
  expect(wrapper.find('[data-testid="phoneNo"]').text()).toBe('+9987399299');
});

test('it should display contact groups', () => {
  expect(wrapper.find('[data-testid="groups"]').first().text()).toBe('Default Group');
});
