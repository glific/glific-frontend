import 'mocks/matchMediaMockq';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import { setUserSession } from 'services/AuthService';
import { ContactField } from './ContactField';
import { MemoryRouter } from 'react-router';
import { contactFieldMocks, createContactField } from 'mocks/ContactFields';
import { setNotification } from 'common/notification';

setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Admin'] }));

const mocks = [createContactField, ...contactFieldMocks];

const wrapper = (
  <MemoryRouter>
    <MockedProvider mocks={mocks} addTypename={false}>
      <ContactField setOpenDialog={vi.fn()} />
    </MockedProvider>
  </MemoryRouter>
);

vi.mock('common/notification', async (importOriginal) => {
  const mod = await importOriginal<typeof import('common/notification')>();
  return {
    ...mod,
    setNotification: vi.fn(),
  };
});

test('it renders contact form successfully', async () => {
  const { container } = render(wrapper);

  expect(container).toBeInTheDocument();
  expect(screen.getByText('Add a new Contact field')).toBeInTheDocument();

  // Get all input elements
  const inputElements = screen.getAllByRole('textbox');
  fireEvent.change(inputElements[0], { target: { value: 'Age Group' } });
  fireEvent.change(inputElements[1], { target: { value: 'age_group' } });
  await waitFor(() => {});
});

test('it saves a contact field', async () => {
  const { container } = render(wrapper);

  expect(container).toBeInTheDocument();
  expect(screen.getByText('Add a new Contact field')).toBeInTheDocument();

  // Get all input elements
  const inputElements = screen.getAllByRole('textbox');
  fireEvent.change(inputElements[0], { target: { value: 'Age Group' } });
  fireEvent.change(inputElements[1], { target: { value: 'age_group' } });

  fireEvent.click(screen.getByTestId('submitActionButton'));

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalled();
  });
});

test('it closes the dialog box on clicking cancel', async () => {
  const { container } = render(wrapper);

  const dialogTitle = screen.getByText('Add a new Contact field');

  expect(container).toBeInTheDocument();
  expect(dialogTitle).toBeInTheDocument();

  fireEvent.click(screen.getByTestId('cancelActionButton'));

  await waitFor(() => {
    expect(dialogTitle).not.toBeInTheDocument();
  });
});
