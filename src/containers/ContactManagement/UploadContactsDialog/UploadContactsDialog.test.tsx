import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing/react';

import { BrowserRouter as Router } from 'react-router';

import { getAllOrganizations } from 'mocks/Organization';

import UploadContactsDialog from './UploadContactsDialog';
import { getCollectionsList } from 'mocks/Collection';
import { importContacts, importContactsNetworkError } from 'mocks/Contact';
import * as Notification from 'common/notification';

const mocks = [...getAllOrganizations, getCollectionsList(''), getCollectionsList('Optin group'), getCollectionsList()];

const setDialogMock = vi.fn();
const props = {
  organizationDetails: {
    id: '1',
    name: 'Glific',
  },
  setDialog: setDialogMock,
  setShowStatus: vi.fn(),
};

const dialogBox = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <UploadContactsDialog {...props} />
    </Router>
  </MockedProvider>
);

test('Upload contact dialog renders correctly and search works for dropdown', async () => {
  const { getByText } = render(dialogBox);

  await waitFor(() => {
    expect(getByText('Upload Contacts')).toBeInTheDocument();
  });

  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Optin group' } });

  await waitFor(() => {
    expect(screen.getByText('Optin group')).toBeInTheDocument();
  });
});

const fillAndSubmitForm = async () => {
  await waitFor(() => {
    expect(screen.getByText('Upload Contacts')).toBeInTheDocument();
  });

  const combobox = screen.getByRole('combobox');
  fireEvent.keyDown(combobox, { key: 'ArrowDown' });
  fireEvent.click(screen.getByText('Optin group'));

  fireEvent.click(screen.getByRole('checkbox'));

  const csvContent = `name,phone
  John Doe,919876543210`;
  const file = new File([csvContent], 'test.csv', { type: 'text/csv' });
  const fileInput = screen.getByTestId('uploadcontacts');
  fireEvent.change(fileInput, { target: { files: [file] } });

  await waitFor(() => {
    expect(screen.getByText('test.csv')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('ok-button'));
};

test('uploads contacts successfully when the form is submitted', async () => {
  const setShowStatus = vi.fn();
  render(
    <MockedProvider mocks={[...mocks, importContacts]} addTypename={false}>
      <Router>
        <UploadContactsDialog {...props} setShowStatus={setShowStatus} />
      </Router>
    </MockedProvider>
  );

  await fillAndSubmitForm();

  await waitFor(() => {
    expect(setShowStatus).toHaveBeenCalledWith(true);
  });
});

test('closes the dialog and shows a warning when uploading contacts fails unexpectedly', async () => {
  const notificationSpy = vi.spyOn(Notification, 'setNotification');
  render(
    <MockedProvider mocks={[...mocks, importContactsNetworkError]} addTypename={false}>
      <Router>
        <UploadContactsDialog {...props} />
      </Router>
    </MockedProvider>
  );

  await fillAndSubmitForm();

  await waitFor(() => {
    expect(notificationSpy).toHaveBeenCalledWith('An error occurred', 'warning');
  });
  expect(setDialogMock).toHaveBeenCalledWith(false);
});
