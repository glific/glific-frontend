import { MemoryRouter } from 'react-router-dom';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';

import { setUserSession } from 'services/AuthService';
import { SEARCH_QUERY } from 'graphql/queries/Search';
import { DEFAULT_ENTITY_LIMIT, DEFAULT_MESSAGE_LIMIT } from 'common/constants';

import { ChatInterface } from './ChatInterface';
import { MockedProvider } from '@apollo/client/testing';
import { chatMocks } from '../ChatMessages/ChatMessages.test';
import { collectionCountSubscription } from 'mocks/Search';
import { collectionCountQuery, markAsReadMock, savedSearchStatusQuery } from 'mocks/Chat';

const cache = new InMemoryCache({ addTypename: false });
cache.writeQuery({
  query: SEARCH_QUERY,
  variables: {
    contactOpts: { limit: DEFAULT_ENTITY_LIMIT },
    filter: {},
    messageOpts: { limit: DEFAULT_MESSAGE_LIMIT },
  },
  data: {
    search: [
      {
        id: 'contact_2',
        group: null,
        contact: {
          id: '2',
          name: 'Effie Cormier',
          phone: '987654321',
          maskedPhone: '98****321',
          lastMessageAt: '2020-06-29T09:31:47Z',
          status: 'VALID',
          fields: '{}',
          bspStatus: 'SESSION_AND_HSM',
          isOrgRead: true,
        },
        messages: [
          {
            id: '1',
            body: 'Hey there whats up?',
            insertedAt: '2020-06-25T13:36:43Z',
            location: null,
            messageNumber: 48,
            receiver: {
              id: '1',
            },
            sender: {
              id: '2',
            },
            type: 'TEXT',
            media: null,
            errors: '{}',
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
  cache: cache,
  uri: 'http://localhost:4000/',
  assumeImmutableResults: true,
});

window.HTMLElement.prototype.scrollIntoView = function () {};

afterEach(cleanup);

const mockedUsedNavigate = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockedUsedNavigate,
}));

const mocks = [
  ...chatMocks,
  collectionCountSubscription,
  collectionCountQuery,
  savedSearchStatusQuery,
  markAsReadMock('2'),
];

beforeEach(() => {
  vi.resetAllMocks();
});

const wrapper = (
  <MemoryRouter>
    <MockedProvider mocks={mocks} cache={cache}>
      <ChatInterface />
    </MockedProvider>
  </MemoryRouter>
);

// set user session
setUserSession(JSON.stringify({ organization: { id: '1' } }));

describe('<ChatInterface />', () => {
  test('it should render <ChatInterface /> component correctly', async () => {
    const { getByText, findByTestId } = render(wrapper);

    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();

    // check if chat conversations are displayed
    const ChatConversation = await findByTestId('beneficiaryName');
    expect(ChatConversation).toHaveTextContent('Effie Cormier');
  });

  test('check condition when no subscription data provided', async () => {
    const { findByTestId } = render(wrapper);

    const ChatConversation = await findByTestId('beneficiaryName');
    expect(ChatConversation).toHaveTextContent('Effie Cormier');
  });

  test('should navigate to collections', async () => {
    const { getByText } = render(wrapper);
    expect(getByText('Loading...')).toBeInTheDocument();

    fireEvent.click(getByText('Collections'));

    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalled();
    });
  });

  test('should navigate to saved searches', async () => {
    const { getByText } = render(wrapper);

    fireEvent.click(getByText('Searches'));

    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalled();
    });
  });

  test('should have Collections as heading', async () => {
    const { getByTestId } = render(
      <ApolloProvider client={client}>
        <MemoryRouter>
          <ChatInterface collectionType={true} />
        </MemoryRouter>
      </ApolloProvider>
    );

    await waitFor(() => {
      expect(getByTestId('heading')).toHaveTextContent('Collections');
    });
  });

  test('should have Saved searches as heading', async () => {
    const { getByText, getByTestId } = render(
      <ApolloProvider client={client}>
        <MemoryRouter>
          <ChatInterface savedSearches={true} />
        </MemoryRouter>
      </ApolloProvider>
    );
    expect(getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(getByTestId('heading')).toHaveTextContent('Saved searches');
    });
  });

  const emptyCache = new InMemoryCache({ addTypename: false });

  emptyCache.writeQuery({
    query: SEARCH_QUERY,
    variables: {
      contactOpts: { limit: DEFAULT_ENTITY_LIMIT },
      filter: {},
      messageOpts: { limit: DEFAULT_MESSAGE_LIMIT },
    },
    data: {
      search: [],
    },
  });

  const clientForEmptyCache = new ApolloClient({
    cache: emptyCache,
    uri: 'http://localhost:4000/',
    assumeImmutableResults: true,
  });

  test('should render no conversations if there are no conversations', async () => {
    const { getByText, getByTestId } = render(
      <ApolloProvider client={clientForEmptyCache}>
        <MemoryRouter>
          <ChatInterface />
        </MemoryRouter>
      </ApolloProvider>
    );

    await waitFor(() => {
      expect(getByTestId('empty-result')).toBeInTheDocument();
    });
  });
});
