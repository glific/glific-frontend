import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { cleanup, render } from '@testing-library/react';
import { Chat } from './Chat';
import { CONVERSATION_MOCKS } from '../../mocks/Chat';
import { setUserSession } from '../../services/AuthService';

import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { SEARCH_QUERY } from '../../graphql/queries/Search';

const cache = new InMemoryCache({ addTypename: false });
cache.writeQuery({
  query: SEARCH_QUERY,
  variables: {
    filter: {},
    messageOpts: { limit: 50 },
    contactOpts: { limit: 50 },
  },
  data: {
    search: [
      {
        group: null,
        contact: {
          id: '2',
          name: 'Jane Doe',
          phone: '987654321',
          maskedPhone: '98****321',
          lastMessageAt: '2020-06-29T09:31:47Z',
          status: 'VALID',
          bspStatus: 'SESSION_AND_HSM',
        },
        messages: [
          {
            id: '1',
            body: 'Hey there whats up?',
            insertedAt: '2020-06-25T13:36:43Z',
            location: null,
            receiver: {
              id: '1',
            },
            sender: {
              id: '2',
            },
            tags: [
              {
                id: '1',
                label: 'important',
                colorCode: '#00d084',
              },
            ],
            type: 'TEXT',
            media: null,
            errors: null,
          },
        ],
      },
    ],
  },
});

const client = new ApolloClient({
  cache: cache,
  assumeImmutableResults: true,
});

const mocks = CONVERSATION_MOCKS;

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
    expect(ChatConversation).toHaveTextContent('Jane Doe');

    // check if tags are displayed in the ChatMessages
    const ConversationTag = await findAllByText('important');
    expect(ConversationTag[0]).toBeInTheDocument();
  });

  test('check condition when no subscription data provided', async () => {
    const { findByTestId } = render(wrapper);

    const ChatConversation = await findByTestId('beneficiaryName');
    expect(ChatConversation).toHaveTextContent('Jane Doe');
  });
});
