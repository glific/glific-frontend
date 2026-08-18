import { render, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router';
import { MockedProvider } from '@apollo/client/testing/react';

import { conversationQuery } from 'mocks/Chat';
import { updateContactStatusQuery, updateContactStatusQueryError } from 'mocks/Contact';
import { setUserSession } from 'services/AuthService';
import * as Notification from 'common/notification';
import { BlockContactList } from './BlockContactList';
import { CONTACT_LIST_MOCKS } from './BlockContact.test.helper';

const mocks = [...CONTACT_LIST_MOCKS, conversationQuery];

const blockContactList = (
  <MockedProvider mocks={mocks}>
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

test('shows an error when unblocking a contact fails', async () => {
  const errorSpy = vi.spyOn(Notification, 'setErrorMessage');
  setUserSession(JSON.stringify({ roles: ['Admin'] }));
  const errorMocks = [
    ...CONTACT_LIST_MOCKS.filter((mock) => mock !== updateContactStatusQuery),
    updateContactStatusQueryError,
    conversationQuery,
  ];
  const { getByText, getByTestId } = render(
    <MockedProvider mocks={errorMocks}>
      <Router>
        <BlockContactList />
      </Router>
    </MockedProvider>
  );

  await waitFor(() => {
    fireEvent.click(getByTestId('additionalButton'));
    fireEvent.click(getByText('Confirm'));
  });

  await waitFor(() => {
    expect(errorSpy).toHaveBeenCalled();
  });
});
