import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import { BrowserRouter as Router } from 'react-router-dom';

import { getAllOrganizations } from 'mocks/Organization';

import UploadContactsDialog from './UploadContactsDialog';
import { getCollectionsList } from 'mocks/Collection';

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
