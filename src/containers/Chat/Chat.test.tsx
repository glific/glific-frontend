import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router-dom';
import { cleanup, render } from '@testing-library/react';

import Chat from './Chat';
import { CONVERSATION_MOCKS } from './Chat.test.helper';

const mocks = CONVERSATION_MOCKS;

describe('<Chat />', () => {
  const defaultProps = {
    contactId: 2,
  };

  window.HTMLElement.prototype.scrollIntoView = function () {};

  afterEach(cleanup);

  test('it should render <Chat /> component correctly', async () => {
    const { findAllByText, getByText } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter>
          <Chat {...defaultProps} />
        </MemoryRouter>
      </MockedProvider>
    );

    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();

    // check if chat conversations are displayed
    const ChatConversation = await findAllByText('Jane Doe');
    expect(ChatConversation).toHaveLength(1);

    // check if tags are displayed in the ChatMessages
    const ConversationTag = await findAllByText('Unread');
    expect(ConversationTag).toHaveLength(2);
  });
});
