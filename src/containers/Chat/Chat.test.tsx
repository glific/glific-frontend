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

  afterEach(cleanup);

  test('it should render <Chat /> component correctly', async () => {
    const { findByText, getByText } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter>
          <Chat {...defaultProps} />
        </MemoryRouter>
      </MockedProvider>
    );
    expect(getByText('Loading...')).toBeInTheDocument();

    const ChatConversation = await findByText('Jane Doe');
    expect(ChatConversation).toBeInTheDocument();
  });
});
