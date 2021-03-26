import React from 'react';
import { AddContactsToCollection } from './AddContactsToCollection';
import { render, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { setUserSession } from '../../../../services/AuthService';
import { getCollectionContactsQuery } from '../../../../mocks/Collection';
import { getContactsQuery } from '../../../../mocks/Contact';

const mocks = [getCollectionContactsQuery, getContactsQuery];

const defaultProps = {
  collectionId: '1',
  setDialog: jest.fn(),
};

afterEach(cleanup);

const addContacts = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <AddContactsToCollection {...defaultProps} />
  </MockedProvider>
);

test('it should have add contact to collection dialog box ', async () => {
  setUserSession(JSON.stringify({ roles: ['Admin'] }));
  const { getByText } = render(addContacts);

  expect(getByText('Add contacts to the collection')).toBeInTheDocument();
  await waitFor(() => {
    expect(getByText('Glific User')).toBeInTheDocument();
  });
});
