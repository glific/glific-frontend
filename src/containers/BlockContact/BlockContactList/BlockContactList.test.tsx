import React from 'react';
import { render, wait } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { BlockContactList } from './BlockContactList';
import { CONTACT_LIST_MOCKS } from './BlockContact.test.helper';

const mocks = CONTACT_LIST_MOCKS;

const blockContactList = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <BlockContactList />
    </Router>
  </MockedProvider>
);

test('it should contain the correct ttile', async () => {
  const { getByText } = render(blockContactList);
  await wait();
  await wait();
  expect(getByText('Blocked contacts')).toBeInTheDocument();
});
