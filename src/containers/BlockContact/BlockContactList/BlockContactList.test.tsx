import React from 'react';
import { render, wait, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { BlockContactList } from './BlockContactList';
import { CONTACT_LIST_MOCKS } from './BlockContact.test.helper';
import { conversationQuery } from '../../../mocks/Chat';
import { setUserSession } from '../../../services/AuthService';

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
  await wait();
  await wait();
  expect(getByText('Blocked contacts')).toBeInTheDocument();
});

test('unblocking a contact', async () => {
  setUserSession(JSON.stringify({ roles: ['Admin'] }));
  const { getByText, getByTestId } = render(blockContactList);
  await wait();
  await wait();
  fireEvent.click(getByTestId('additionalButton'));
  fireEvent.click(getByText('Confirm'));
  await wait();
  expect(getByText('Contact unblocked successfully')).toBeInTheDocument();
});
