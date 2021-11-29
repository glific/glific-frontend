import { render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import { BrowserRouter as Router } from 'react-router-dom';

import { getAllOrganizations } from 'mocks/Organization';

import UploadContactsDialog from './UploadContactsDialog';
import { getCollectionsQuery } from 'mocks/Collection';

const mocks = [...getAllOrganizations, ...getCollectionsQuery];

const setDialogMock = jest.fn();
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

test('Upload contact dialog  renders correctly', async () => {
  const { getByText } = render(dialogBox);

  expect(getByText('Loading...')).toBeInTheDocument();
  await waitFor(() => {
    expect(getByText('Upload contacts: Glific')).toBeInTheDocument();
  });
});
