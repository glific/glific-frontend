import 'mocks/matchMediaMock';
import { MemoryRouter } from 'react-router-dom';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';

import { setUserSession } from 'services/AuthService';
import { GROUP_QUERY_VARIABLES } from 'common/constants';
import GroupChatInterface from './GroupChatInterface';
import { GROUP_SEARCH_QUERY } from 'graphql/queries/WaGroups';
import { waGroupcollection } from 'mocks/Groups';

const cache = new InMemoryCache({ addTypename: false });
cache.writeQuery({
  query: GROUP_SEARCH_QUERY,
  variables: GROUP_QUERY_VARIABLES,
  data: {
    search: [
      {
        id: 'waGroup_6',
        messages: [
          {
            __typename: 'WaMessage',
            body: 'hey there',
            contact: {
              __typename: 'Contact',
              name: null,
            },
            contextMessage: null,
            errors: null,
            id: '45',
            insertedAt: '2024-03-11T14:28:54.842909Z',
            media: null,
            messageNumber: 3,
            status: 'sent',
            type: 'TEXT',
          },
        ],
        waGroup: {
          __typename: 'WaGroup',
          bspId: '120363254172504067@g.us',
          id: '6',
          label: 'WA Group 1',
          lastCommunicationAt: '2024-03-11T14:12:55Z',
          waManagedPhone: {
            __typename: 'WaManagedPhone',
            id: '3',
            label: null,
            phone: '918657048983',
            phoneId: 43876,
          },
        },
        group: null,
      },
      {
        id: 'waGroup_9',
        __typename: 'WaConversation',
        messages: [
          {
            __typename: 'WaMessage',
            body: 'hi',
            contact: {
              __typename: 'Contact',
              name: null,
            },
            contextMessage: null,
            errors: null,
            id: '43',
            insertedAt: '2024-03-11T14:28:44.617238Z',
            media: null,
            messageNumber: 2,
            status: 'sent',
            type: 'TEXT',
          },
        ],
        waGroup: {
          __typename: 'WaGroup',
          bspId: '120363236785156570@g.us',
          id: '9',
          label: 'WA Group 18',
          lastCommunicationAt: '2024-03-11T23:28:45Z',
          waManagedPhone: {
            __typename: 'WaManagedPhone',
            id: '3',
            label: null,
            phone: '918657048983',
            phoneId: 43876,
          },
        },
        group: null,
      },
      {
        id: 'waGroup_1',
        __typename: 'WaConversation',
        messages: [
          {
            __typename: 'WaMessage',
            body: 'hey',
            contact: {
              __typename: 'Contact',
              name: 'default reciever',
            },
            contextMessage: null,
            errors: null,
            id: '11',
            insertedAt: '2024-03-11T12:49:44.406045Z',
            media: null,
            messageNumber: 4,
            status: 'sent',
            type: 'TEXT',
          },
          {
            __typename: 'WaMessage',
            body: 'hi',
            contact: {
              __typename: 'Contact',
              name: 'test',
            },
            contextMessage: null,
            errors: null,
            id: '10',
            insertedAt: '2024-03-11T12:49:39.915883Z',
            media: null,
            messageNumber: 3,
            status: 'sent',
            type: 'TEXT',
          },
        ],
        waGroup: {
          __typename: 'WaGroup',
          bspId: '745572428506626346@g.us',
          id: '1',
          label: 'Oklahoma sheep',
          lastCommunicationAt: '2024-03-12T14:12:30Z',
          waManagedPhone: {
            __typename: 'WaManagedPhone',
            id: '1',
            label: null,
            phone: '8238389740',
            phoneId: 8220,
          },
        },
        group: null,
      },
    ],
  },
});

cache.writeQuery(waGroupcollection);

const mockedUsedNavigate = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockedUsedNavigate,
}));

const client = new ApolloClient({
  cache: cache,
  uri: 'http://localhost:4000/',
  assumeImmutableResults: true,
});

window.HTMLElement.prototype.scrollIntoView = function scrollIntoViewMock() {};

afterEach(cleanup);

const route = '/group/chat';

const wrapper = (
  <ApolloProvider client={client}>
    <MemoryRouter initialEntries={[route]}>
      <GroupChatInterface />
    </MemoryRouter>
  </ApolloProvider>
);

// set user session
setUserSession(JSON.stringify({ organization: { id: '1' } }));

describe('<GroupChatInterface />', () => {
  test('it should render <GroupChatInterface /> component correctly', async () => {
    const { findByTestId } = render(wrapper);

    await waitFor(async () => {
      const conversationHeader = await findByTestId('beneficiaryName');
      expect(conversationHeader).toHaveTextContent('WA Group 1');
    });
  });

  test('should navigate to collections', async () => {
    const { getByText } = render(wrapper);
    // expect(getByText('Loading...')).toBeInTheDocument();

    fireEvent.click(getByText('Collections'));

    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalled();
    });
  });

  test('should have Collections as heading', async () => {
    const { getByText, getByTestId } = render(
      <ApolloProvider client={client}>
        <MemoryRouter>
          <GroupChatInterface collections={true} />
        </MemoryRouter>
      </ApolloProvider>
    );
    expect(getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(getByTestId('heading')).toHaveTextContent('Group Collections');
    });
  });

  const emptyCache = new InMemoryCache({ addTypename: false });

  emptyCache.writeQuery({
    query: GROUP_SEARCH_QUERY,
    variables: GROUP_QUERY_VARIABLES,
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
    const { getByTestId } = render(
      <ApolloProvider client={clientForEmptyCache}>
        <MemoryRouter>
          <GroupChatInterface />
        </MemoryRouter>
      </ApolloProvider>
    );

    await waitFor(() => {
      expect(getByTestId('empty-result')).toBeInTheDocument();
    });
  });
});
