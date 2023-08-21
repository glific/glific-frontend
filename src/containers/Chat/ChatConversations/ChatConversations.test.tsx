import { BrowserRouter as Router } from 'react-router-dom';
import { render, waitFor, fireEvent, cleanup, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';

import { SEARCH_QUERY } from 'graphql/queries/Search';
import { DEFAULT_CONTACT_LIMIT, DEFAULT_MESSAGE_LIMIT } from 'common/constants';
import ChatConversations from './ChatConversations';
import { ChatConversationMocks } from './ChatConversations.test.helper';
import { setUserSession } from 'services/AuthService';

setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Admin'] }));
const cache = new InMemoryCache({ addTypename: false });
cache.writeQuery({
  query: SEARCH_QUERY,
  variables: {
    contactOpts: { limit: DEFAULT_CONTACT_LIMIT },
    filter: {},
    messageOpts: { limit: DEFAULT_MESSAGE_LIMIT },
  },
  data: {
    search: [
      {
        group: null,
        contact: {
          id: '2',
          fields: '{}',
          name: 'Effie Cormier',
          phone: '987654321',
          maskedPhone: '98****321',
          lastMessageAt: '2020-06-29T09:31:47Z',
          status: 'VALID',
          bspStatus: 'SESSION_AND_HSM',
          isOrgRead: true,
        },
        messages: [
          {
            id: '1',
            body: 'Hey there whats up?',
            insertedAt: '2020-06-25T13:36:43Z',
            location: null,
            messageNumber: 0,
            receiver: {
              id: '1',
            },
            sender: {
              id: '2',
            },
            type: 'TEXT',
            media: null,
            errors: null,
            contextMessage: {
              body: 'All good',
              contextId: 1,
              messageNumber: 10,
              errors: '{}',
              media: null,
              type: 'TEXT',
              insertedAt: '2021-04-26T06:13:03.832721Z',
              location: null,
              receiver: {
                id: '1',
              },
              sender: {
                id: '2',
                name: 'User',
              },
            },
            interactiveContent: '{}',
            sendBy: 'test',
            flowLabel: null,
          },
        ],
      },
    ],
  },
});

const client = new ApolloClient({
  cache,
  uri: 'http://localhost:4000/',
  assumeImmutableResults: true,
});

afterEach(cleanup);

const simulatorParams = {
  contactId: 1,
  simulatorId: 1,
  setShowSimulator: vi.fn(),
};

const chatConversation = (
  <ApolloProvider client={client}>
    <MockedProvider mocks={ChatConversationMocks} addTypename={false}>
      <Router>
        <ChatConversations {...simulatorParams} />
      </Router>
    </MockedProvider>
  </ApolloProvider>
);

test('it should render <ChatConversations /> component correctly', async () => {
  const { container } = render(chatConversation);
  await waitFor(() => {
    expect(container).toBeInTheDocument();
  });
});

test('it should filter contacts based on search', async () => {
  const { getByTestId } = render(chatConversation);
  await waitFor(() => {
    fireEvent.change(getByTestId('searchInput').querySelector('input') as HTMLElement, {
      target: { value: 'a' },
    });
    fireEvent.submit(getByTestId('searchForm'));
  });
});

test('it should reset input on clicking cross icon', async () => {
  const { getByTestId } = render(chatConversation);
  await waitFor(() => {
    fireEvent.change(getByTestId('searchInput').querySelector('input') as HTMLElement, {
      target: { value: 'a' },
    });
    const resetButton = getByTestId('resetButton');
    fireEvent.click(resetButton);
  });
});

test('it should load all contacts with unread tag', async () => {
  const { getAllByTestId, getAllByText } = render(chatConversation);
  // loading is show initially
  expect(getAllByText('Loading...')).toHaveLength(2);
  await waitFor(() => {
    fireEvent.click(getAllByTestId('savedSearchDiv')[0]);
  });

  // need to fix
  // expect(getByText('You do not have any conversations.')).toBeInTheDocument();
});

test('it should render dialog when advance search is click', async () => {
  const { container } = render(chatConversation);

  await waitFor(() => {
    expect(container).toBeInTheDocument();
  });

  const dialog = await screen.getByTestId('advanced-search-icon');
  expect(dialog).toBeInTheDocument();

  await waitFor(() => {
    fireEvent.click(dialog);
  });
});
