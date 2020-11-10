import React from 'react';
import { mount } from 'enzyme';
import { ContactDescription } from './ContactDescription';

const date = new Date();
const defaultProps = {
  fields: '{"Age":"14"}',
  phoneNo: '9987399299',
  settings: '{"Status":"Active"}',
  groups: [{ id: 1, label: 'Default Group', users: [{ name: 'Glific' }] }],
  lastMessage: new Date(),
};
const propsWithMultipleGroups = {
  fields: {},
  phoneNo: '9987399299',
  settings: {},
  groups: [
    { id: 1, label: 'Default Group', users: [{ name: 'Glific' }] },
    { id: 2, label: 'Poetry Group', users: [{ name: 'Admin' }] },
    { id: 2, label: 'Staff Group', users: [{ name: 'Staff manager' }] },
  ],
  lastMessage: new Date(),
};

const wrapper = mount(<ContactDescription {...defaultProps}></ContactDescription>);

it('should render ContactDescription', () => {
  expect(wrapper.exists()).toBe(true);
});

test('it should display contact number', () => {
  expect(wrapper.find('[data-testid="phoneNo"]').text()).toBe('+9987399299');
});

test('it should display contact groups', () => {
  expect(wrapper.find('[data-testid="groups"]').first().text()).toBe('Default Group');
});

test('it should display multiple groups properly', () => {
  const wrapper1 = mount(<ContactDescription {...propsWithMultipleGroups}></ContactDescription>);
  expect(wrapper1.find('[data-testid="groups"]').first().text()).toBe('Default Group, Poetry Group, Staff Group');
});