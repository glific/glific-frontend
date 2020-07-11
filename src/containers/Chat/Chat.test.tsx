import React from 'react';
import { MockedProvider } from '@apollo/client/testing';

import Chat from './Chat';
import { CONVERSATION_MOCKS } from './Chat.test.helper';
import { cleanup, render } from '@testing-library/react';
import { Router } from 'react-router-dom';

const mocks = CONVERSATION_MOCKS;

describe('<Chat />', () => {
  const defaultProps = {
    contactId: 2,
  };

  afterEach(cleanup);

  test('it should render <Chat /> component correctly', async () => {
    const { findByText, getByText } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Router>
          <Chat {...defaultProps} />
        </Router>
      </MockedProvider>
    );
    expect(getByText('Loading...')).toBeInTheDocument();

    const ChatConversation = await findByText('Jane Doe');
    expect(ChatConversation).toBeInTheDocument();
  });
});
