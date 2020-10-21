import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router-dom';
import { cleanup, render } from '@testing-library/react';
import { Chat } from './Chat';
import { CONVERSATION_MOCKS } from '../../mocks/Chat';
import { setUserSession } from '../../services/AuthService';

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

// set user session
setUserSession(JSON.stringify({ organization: { id: '1' } }));

describe('<Chat />', () => {
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
});
