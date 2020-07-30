import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router-dom';
import { cleanup, render, wait } from '@testing-library/react';

import Chat from './Chat';
import { CONVERSATION_MOCKS, CONVERSATION_MOCKS_WITH_NO_DATA } from './Chat.test.helper';

const mocks = CONVERSATION_MOCKS;

const defaultProps = {
  contactId: 2,
};

window.HTMLElement.prototype.scrollIntoView = function () {};

afterEach(cleanup);

const wrapper = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter>
      <Chat {...defaultProps} />
    </MemoryRouter>
  </MockedProvider>
);

test('it should render <Chat /> component correctly', async () => {
  const { findAllByText, getByText, findByTestId } = render(wrapper);

  // loading is show initially
  expect(getByText('Loading...')).toBeInTheDocument();
  // check if chat conversations are displayed
  const ChatConversation = await findByTestId('beneficiaryName');
  expect(ChatConversation).toHaveTextContent('Jane Doe');

  // check if tags are displayed in the ChatMessages
  const ConversationTag = await findAllByText('Unread');
  expect(ConversationTag).toHaveLength(2);
});

test('check condition when no subscription data provided', async () => {
  const { findByTestId } = render(wrapper);

  const ChatConversation = await findByTestId('beneficiaryName');
  expect(ChatConversation).toHaveTextContent('Jane Doe');
});
