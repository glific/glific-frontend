import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { cleanup, render } from '@testing-library/react';
import { Chat } from './Chat';
import { setUserSession } from '../../services/AuthService';

import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { searchQuery } from './ChatMessages/ChatMessages.test';

const cache = new InMemoryCache({ addTypename: false });
cache.writeQuery(searchQuery);

const client = new ApolloClient({
  cache: cache,
  assumeImmutableResults: true,
});

const defaultProps = {
  contactId: 2,
};

window.HTMLElement.prototype.scrollIntoView = function () {};

afterEach(cleanup);

const wrapper = (
  <ApolloProvider client={client}>
    <MemoryRouter>
      <Chat {...defaultProps} />
    </MemoryRouter>
  </ApolloProvider>
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
    expect(ChatConversation).toHaveTextContent('Effie Cormier');

    // check if tags are displayed in the ChatMessages
    const ConversationTag = await findAllByText('important');
    expect(ConversationTag[0]).toBeInTheDocument();
  });

  test('check condition when no subscription data provided', async () => {
    const { findByTestId } = render(wrapper);

    const ChatConversation = await findByTestId('beneficiaryName');
    expect(ChatConversation).toHaveTextContent('Effie Cormier');
  });
});
