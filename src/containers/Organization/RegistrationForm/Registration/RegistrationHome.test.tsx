import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { RegistrationHome } from './RegistrationHome';
import { MemoryRouter } from 'react-router';

test('it should render registration home page', async () => {
  const { getByText } = render(
    <MemoryRouter initialEntries={['/organization-registration']}>
      <RegistrationHome />
    </MemoryRouter>
  );

  await waitFor(() => {
    expect(getByText('Set up your NGO on Glific')).toBeInTheDocument();
  });

  fireEvent.click(getByText('Get started'));

  await waitFor(() => {
    expect(screen.getByTestId('heading')).toHaveTextContent('Glific platform details');
  });
});
