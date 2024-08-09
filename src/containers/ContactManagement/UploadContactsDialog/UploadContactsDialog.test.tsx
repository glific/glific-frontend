import { render, waitFor, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockedProvider } from '@apollo/client/testing';

import { BrowserRouter as Router } from 'react-router-dom';

import { getAllOrganizations } from 'mocks/Organization';

import UploadContactsDialog from './UploadContactsDialog';
import { filterCollectionQuery } from 'mocks/Collection';
import { CONTACTS_COLLECTION } from 'common/constants';
import { importContacts } from 'mocks/Contact';

const mocks = [
  ...getAllOrganizations,
  filterCollectionQuery({
    filter: {
      groupType: CONTACTS_COLLECTION,
    },
    opts: {
      limit: 50,
      offset: 0,
      order: 'ASC',
    },
  }),
  importContacts,
];

const setDialogMock = vi.fn();
const props = {
  organizationDetails: {
    id: '1',
    name: 'Glific',
  },
  setDialog: setDialogMock,
};

const dialogBox = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <UploadContactsDialog {...props} />
    </Router>
  </MockedProvider>
);

test('Upload contact dialog renders correctly', async () => {
  const { getByText } = render(dialogBox);

  expect(getByText('Loading...')).toBeInTheDocument();
  await waitFor(() => {
    expect(getByText('Upload Contacts')).toBeInTheDocument();
  });
});

test.skip('Files other than .csv should raise a warning message upon upload', async () => {
  render(dialogBox);

  const nonCSVFile = new File(['This is not a CSV File'], 'test.pdf', { type: 'application/pdf' });
  await waitFor(() => {
    const fileInput = screen.getByTestId('uploadFile');
    userEvent.upload(fileInput, nonCSVFile);
  });
  await waitFor(() => {
    expect(screen.getByTestId('invalidCsvFormat')).toBeInTheDocument();
  });
});

test('Should be able to upload valid CSV', async () => {
  render(dialogBox);

  // Valid CSV
  const csvContent = `name,phone,collection
  John Doe,919876543210,"Optin collection,Optout Collection"
  Virat Kohli,919876543220,Cricket`;
  const file = new File([csvContent], 'test.csv', { type: 'text/csv' });

  await waitFor(() => {
    const fileInput = screen.getByTestId('import');
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
