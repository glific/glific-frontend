import { render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import { BrowserRouter as Router } from 'react-router-dom';

import { getAllOrganizations } from 'mocks/Organization';

import UploadContactsDialog from './UploadContactsDialog';
import { filterCollectionQuery } from 'mocks/Collection';
import { CONTACTS_COLLECTION } from 'common/constants';

const mocks = [
  ...getAllOrganizations,
  filterCollectionQuery({
    filter: {
      groupType: CONTACTS_COLLECTION,
    },
    opts: {
      limit: null,
      offset: 0,
      order: 'ASC',
    },
  }),
];

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

test('Upload contact dialog renders correctly', async () => {
  const { getByText } = render(dialogBox);

  expect(getByText('Loading...')).toBeInTheDocument();
  await waitFor(() => {
    expect(getByText('Upload Contacts')).toBeInTheDocument();
  });
});
