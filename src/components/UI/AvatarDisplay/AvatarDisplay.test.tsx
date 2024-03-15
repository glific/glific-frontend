import { MemoryRouter } from 'react-router';
import { AvatarDisplay } from './AvatarDisplay';
import { render } from '@testing-library/react';

test('it displays avatar with initials', () => {
  const { getByText } = render(
    <MemoryRouter>
      <AvatarDisplay name="Jane Doe" />
    </MemoryRouter>
  );
  expect(getByText('J')).toBeInTheDocument();
});

test('it has "large" class for type large', () => {
  const { getByText } = render(
    <MemoryRouter>
      <AvatarDisplay name="Jane Doe" type="large" />
    </MemoryRouter>
  );

  expect(getByText('J')).toHaveClass('large');
});
