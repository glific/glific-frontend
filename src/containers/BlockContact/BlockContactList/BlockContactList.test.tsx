import { render, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';

import { conversationQuery } from 'mocks/Chat';
import { setUserSession } from 'services/AuthService';
import { BlockContactList } from './BlockContactList';
import { CONTACT_LIST_MOCKS } from './BlockContact.test.helper';

const mocks = [...CONTACT_LIST_MOCKS, conversationQuery];

const blockContactList = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <BlockContactList />
    </Router>
  </MockedProvider>
);

test('it should contain the correct title', async () => {
  const { getByText } = render(blockContactList);
  await waitFor(() => {
    expect(getByText('Blocked contacts')).toBeInTheDocument();
  });
});

test('unblocking a contact', async () => {
  setUserSession(JSON.stringify({ roles: ['Admin'] }));
  const { getByText, getByTestId } = render(blockContactList);
  await waitFor(() => {
    fireEvent.click(getByTestId('additionalButton'));
    fireEvent.click(getByText('Confirm'));
  });
});
