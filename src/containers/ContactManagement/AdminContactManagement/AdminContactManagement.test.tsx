import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockedProvider } from '@apollo/client/testing';

import { BrowserRouter as Router } from 'react-router';

import { getAllOrganizations } from 'mocks/Organization';

import { setUserSession } from 'services/AuthService';
import { AdminContactManagement } from './AdminContactManagement';

const mocks = getAllOrganizations;

setUserSession(JSON.stringify({ roles: [{ label: 'Admin' }], organization: { id: '1' } }));

const contactManagement = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <AdminContactManagement setShowStatus={vi.fn()} />
    </Router>
  </MockedProvider>
);

// let's mock setNotification function that's called upon successful upload
vi.mock('common/notification', async (importOriginal) => {
  const mod = await importOriginal<typeof import('common/notification')>();
  return {
    ...mod,
    setNotification: vi.fn(),
  };
});

test('Admin contact management form renders correctly', async () => {
  render(contactManagement);
  const helpText = await screen.getByText(
    'You can move contacts to collections in bulk or update their contact information. Please create csv file that exactly matches the sample.'
  );
  expect(helpText).toBeInTheDocument();
});

test('the page should have a disabled upload button by default', async () => {
  render(contactManagement);

  const uploadButton = await screen.getByTestId('moveContactsBtn');
  expect(uploadButton).toBeInTheDocument();
  expect(uploadButton).toHaveAttribute('disabled');
});

test('Files other than .csv should raise a warning message upon upload', async () => {
  render(contactManagement);

  const nonCSVFile = new File(['This is not a CSV File'], 'test.pdf', { type: 'application/pdf' });
  await waitFor(() => {
    const fileInput = screen.getByTestId('uploadFile');
    userEvent.upload(fileInput, nonCSVFile);
  });
  await waitFor(() => {
    expect(screen.getByText(/Please make sure the file format matches the sample/)).toBeInTheDocument();
  });
});

test('it removes the selected file', async () => {
  render(contactManagement);

  fireEvent.click(screen.getByTestId('uploadFile'));

  const csvContent = `name,phone,collection
  John Doe,919876543210,"Optin collection,Optout Collection"
  Virat Kohli,919876543220,Cricket`;
  const file = new File([csvContent], 'test.csv', { type: 'text/csv' });

  await waitFor(() => {
    const fileInput = screen.getByTestId('uploadFile');
    userEvent.upload(fileInput, file);
  });

  await waitFor(() => {
    // the filename should be visible instead of Select .csv after upload
    expect(screen.getByText('test.csv')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('cross-icon'));

  await waitFor(() => {
    expect(screen.queryByText('test.csv')).not.toBeInTheDocument();
  });
});
