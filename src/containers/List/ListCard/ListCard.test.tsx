import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import { ListCard } from './ListCard';

const defaultProps = {
  data: [
    {
      id: '1',
      label: 'Staff Management Collection',
      description: 'All staff members of the organization',
      operations: null,
    },
  ],
  link: '/details',
};

const card = (
  <MemoryRouter>
    <ListCard {...defaultProps} />
  </MemoryRouter>
);

test('it should have correct label', () => {
  const { getByTestId } = render(card);
  expect(getByTestId('label')).toHaveTextContent('Staff Management Collection');
});

test('it should have correct description', () => {
  const { getByTestId } = render(card);
  expect(getByTestId('description')).toHaveTextContent('All staff members of the organization');
});
