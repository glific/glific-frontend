import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import { BrowserRouter as Router } from 'react-router-dom';

import ContactManagement from './ContactManagement';
import { filterCollectionQuery } from 'mocks/Collection';
import { CONTACTS_COLLECTION } from 'common/constants';

const mocks = [
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
];

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
