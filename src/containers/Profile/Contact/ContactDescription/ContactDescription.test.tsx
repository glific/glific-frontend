import { fireEvent, render, screen } from '@testing-library/react';

import { ContactDescription } from './ContactDescription';

const defaultProps = {
  fields:
    '{"name":{"value":"hey","type":"string","label":"Name","inserted_at":"2021-08-04T11:00:33.693233Z"}}',
  phone: '9987399299',
  maskedPhone: '9987399299',
  settings: '{"Status":"Active"}',
  collections: [{ id: 1, label: 'Default Collection', users: [{ name: 'Glific' }] }],
  lastMessage: new Date(),
};
const propsWithMultipleCollections = {
  fields: {},
  phone: '9987399299',
  maskedPhone: '9987399299',
  settings: {},
  collections: [
    { id: 1, label: 'Default Collection', users: [{ name: 'Glific' }] },
    { id: 2, label: 'Poetry Collection', users: [{ name: 'Admin' }] },
    { id: 2, label: 'Staff Collection', users: [{ name: 'Staff manager' }] },
  ],
  lastMessage: new Date(),
};

const wrapper = <ContactDescription {...defaultProps}></ContactDescription>;

it('should render ContactDescription', () => {
  const { getByTestId, container } = render(wrapper);
  expect(getByTestId('contactDescription')).toBeInTheDocument();
  // toggle phone visibility

  const togglePhone = screen.getByRole('button');
  fireEvent.click(togglePhone);
});

test('it should display contact number', () => {
  const { getByTestId } = render(wrapper);
  expect(getByTestId('phone')).toHaveTextContent('+9987399299');
});

test('it should display contact collections', () => {
  const { getAllByTestId } = render(wrapper);
  expect(getAllByTestId('collections')[0]).toHaveTextContent('Default Collection');
});

test('it should display multiple collections properly', () => {
  const { getAllByTestId } = render(
    <ContactDescription {...propsWithMultipleCollections}></ContactDescription>
  );
  expect(getAllByTestId('collections')[0]).toHaveTextContent(
    'Default Collection, Poetry Collection, Staff Collection'
  );
});
