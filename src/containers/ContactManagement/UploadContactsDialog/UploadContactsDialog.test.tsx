import { render, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockedProvider } from '@apollo/client/testing';

import { BrowserRouter as Router } from 'react-router-dom';

import { getAllOrganizations } from 'mocks/Organization';

import UploadContactsDialog from './UploadContactsDialog';
import { getOrganizationCollections } from 'mocks/Collection';

const mocks = [...getAllOrganizations, getOrganizationCollections];

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
    expect(getByText('Upload contacts: Glific')).toBeInTheDocument();
  });
});

test('Files other than .csv should raise a warning message upon upload', async() => {
  render(dialogBox);

  const nonCSVFile = new File(['This is not a CSV File'], 'test.pdf', {type: 'application/pdf'});
  await waitFor(() => {
    const fileInput = screen.getByTestId('uploadFile');
    userEvent.upload(fileInput, nonCSVFile);
  })
  await waitFor(() => {
    expect(screen.getByTestId('invalidCsvFormat')).toBeInTheDocument();
  })
})

test('Should be able to upload valid CSV', async () => {
  render(dialogBox);

  // Valid CSV
  const csvContent = `name,phone,collection
  John Doe,919876543210,"Optin collection,Optout Collection"
  Virat Kohli,919876543220,Cricket`;
  const file = new File([csvContent], 'test.csv', {type: 'text/csv'});

  await waitFor(() => {
    const fileInput = screen.getByTestId('uploadFile');
    userEvent.upload(fileInput, file);
  })
  await waitFor(() => {
    // the filename should be visible instead of Select .csv after upload
    expect(screen.getByText('test.csv')).toBeInTheDocument();
  })
})
