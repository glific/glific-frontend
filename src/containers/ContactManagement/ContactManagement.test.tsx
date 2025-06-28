import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import { BrowserRouter as Router } from 'react-router';

import ContactManagement from './ContactManagement';
import { getCollectionsList } from 'mocks/Collection';
import userEvent from '@testing-library/user-event';
import { importContacts, moveContacts } from 'mocks/Contact';

const mocks = [getCollectionsList(''), importContacts, moveContacts];

const contactManagement = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <ContactManagement />
    </Router>
  </MockedProvider>
);

test('it opens contact upload dialog', async () => {
  render(contactManagement);

  await waitFor(() => {
    expect(screen.getByText('Contact Management')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('uploadContactsBtn'));

  await waitFor(() => {
    expect(screen.getByText('Upload Contacts')).toBeInTheDocument();
  });
});

test('Should be able import contacts', async () => {
  render(contactManagement);

  await waitFor(() => {
    expect(screen.getByText('Contact Management')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('uploadContactsBtn'));

  await waitFor(() => {
    expect(screen.getByText('Upload Contacts')).toBeInTheDocument();
  });

  // Valid CSV
  const csvContent = `name,phone,collection
  John Doe,919876543210,"Optin collection,Optout Collection"
  Virat Kohli,919876543220,Cricket`;
  const file = new File([csvContent], 'test.csv', { type: 'text/csv' });

  await waitFor(() => {
    const fileInput = screen.getByTestId('uploadcontacts');
    userEvent.upload(fileInput, file);
  });
  await waitFor(() => {
    // the filename should be visible instead of Select .csv after upload
    expect(screen.getByText('test.csv')).toBeInTheDocument();
  });

  const autocomplete = screen.getByTestId('autocomplete-element');

  fireEvent.click(autocomplete);
  fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });
  fireEvent.click(screen.getByText('Staff group'));

  fireEvent.click(screen.getByTestId('ok-button'));
  fireEvent.click(screen.getByText('Are these contacts opted in?'));
  fireEvent.click(screen.getByTestId('ok-button'));

  await waitFor(() => {
    expect(screen.getByText('Contact import is in progress.')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText('Go to notifications'));
});

test('Should be able to move contacts', async () => {
  render(contactManagement);

  await waitFor(() => {
    expect(screen.getByText('Contact Management')).toBeInTheDocument();
  });

  // Valid CSV
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

  fireEvent.click(screen.getByTestId('moveContactsBtn'));

  await waitFor(() => {
    expect(screen.getByText('Contact import is in progress.')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText('Go to notifications'));
});
