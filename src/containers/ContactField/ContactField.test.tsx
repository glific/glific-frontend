import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import { setUserSession } from 'services/AuthService';
import { ContactField } from './ContactField';

setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Admin'] }));

const wrapper = (
  <MockedProvider mocks={[]} addTypename={false}>
    <ContactField setOpenDialog={vi.fn()} />
  </MockedProvider>
);

test('it renders contact form successfully', async () => {
  const { container } = render(wrapper);

  expect(container).toBeInTheDocument();
  expect(screen.getByText('Add contact fields')).toBeInTheDocument();

  // Get all input elements
  const inputElements = screen.getAllByRole('textbox');
  fireEvent.change(inputElements[0], { target: { value: 'Age Group' } });
  fireEvent.change(inputElements[1], { target: { value: 'age_group' } });
  await waitFor(() => {});
});
