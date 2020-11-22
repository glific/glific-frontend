import React from 'react';
import { render } from '@testing-library/react';
import { ContactDescription } from './ContactDescription';

const date = new Date();
const defaultProps = {
  fields: '{"Age":"14"}',
  phone: '9987399299',
  maskedPhone: '9987399299',
  settings: '{"Status":"Active"}',
  groups: [{ id: 1, label: 'Default Group', users: [{ name: 'Glific' }] }],
  lastMessage: new Date(),
};
const propsWithMultipleGroups = {
  fields: {},
  phone: '9987399299',
  maskedPhone: '9987399299',
  settings: {},
  groups: [
    { id: 1, label: 'Default Group', users: [{ name: 'Glific' }] },
    { id: 2, label: 'Poetry Group', users: [{ name: 'Admin' }] },
    { id: 2, label: 'Staff Group', users: [{ name: 'Staff manager' }] },
  ],
  lastMessage: new Date(),
};

const wrapper = <ContactDescription {...defaultProps}></ContactDescription>;

it('should render ContactDescription', () => {
  const { getByTestId } = render(wrapper);
  expect(getByTestId('contactDescription')).toBeInTheDocument();
});

test('it should display contact number', () => {
  const { getByTestId } = render(wrapper);
  expect(getByTestId('phone')).toHaveTextContent('+9987399299');
});

test('it should display contact groups', () => {
  const { getAllByTestId } = render(wrapper);
  expect(getAllByTestId('groups')[0]).toHaveTextContent('Default Group');
});

test('it should display multiple groups properly', () => {
  const { getAllByTestId } = render(
    <ContactDescription {...propsWithMultipleGroups}></ContactDescription>
  );
  expect(getAllByTestId('groups')[0]).toHaveTextContent('Default Group, Poetry Group, Staff Group');
});
