import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import { StaffManagement } from './StaffManagement';
import { STAFF_MANAGEMENT_MOCKS } from './StaffManagement.test.helper';

const mocks = STAFF_MANAGEMENT_MOCKS;

const staffManagement = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <StaffManagement match={{ params: { id: '1' } }} />
  </MockedProvider>
);

test('should load the staff user edit form', async () => {
  render(staffManagement);

  await waitFor(() => {
    const submitButton = screen.getByRole('button', { name: 'Save' });
    expect(submitButton).toBeInTheDocument();

    fireEvent.click(submitButton);
  });

  await waitFor(() => {});
});

test('it should have a help link', async () => {
  render(staffManagement);

  // loading is show initially
  expect(screen.getByText('Loading...')).toBeInTheDocument();
  await waitFor(() => {
    const helpButton = screen.getByTestId('helpButton');
    fireEvent.click(helpButton);
  });

  expect(screen.getByText('User roles')).toBeInTheDocument();

  const closeButton = screen.getByRole('button', { name: 'Close' });
  expect(closeButton).toBeInTheDocument();

  fireEvent.click(closeButton);
  await waitFor(() => {});
});
