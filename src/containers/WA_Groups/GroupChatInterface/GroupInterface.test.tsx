import { MemoryRouter } from 'react-router-dom';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';

import { setUserSession } from 'services/AuthService';
import { DEFAULT_CONTACT_LIMIT, DEFAULT_MESSAGE_LIMIT } from 'common/constants';
import GroupChatInterface from './GroupChatInterface';
import { GROUP_SEARCH_QUERY } from 'graphql/queries/WA_Groups';

const cache = new InMemoryCache({ addTypename: false });
cache.writeQuery({
  query: GROUP_SEARCH_QUERY,
  variables: {
    waGroupOpts: { limit: DEFAULT_CONTACT_LIMIT },
    filter: {
      waPhoneIds: ['1'],
    },
    waMessageOpts: { limit: DEFAULT_MESSAGE_LIMIT },
  },
  data: {
    search: [
      {
        __typename: 'WaConversation',
        waGroup: {
          __typename: 'WaGroup',
          bspId: '120363247648094024@g.us',
          id: '3',
          label: 'test',
          lastCommunicationAt: '2024-03-01T04:23:36Z',
          waManagedPhone: {
            __typename: 'WaManagedPhone',
            id: '3',
            label: null,
            phone: '918657048983',
            phoneId: 43876,
          },
        },
        messages: [
          {
            __typename: 'WaMessage',
            id: '11',
            body: 'hi',
            insertedAt: '2024-03-01T04:23:35.825536Z',
            messageNumber: 8,
            type: 'TEXT',
            status: 'received',
            media: null,
            contact: {
              __typename: 'Contact',
              name: 'akansha',
            },
            errors: null,
            contextMessage: null,
          },
          {
            __typename: 'WaMessage',
            id: '10',
            body: 'test',
            insertedAt: '2024-03-01T04:23:23.255910Z',
            messageNumber: 7,
            type: 'TEXT',
            status: 'sent',
            media: null,
            contact: {
              __typename: 'Contact',
              name: null,
            },
            errors: null,
            contextMessage: null,
          },
          {
            __typename: 'WaMessage',
            id: '9',
            body: 'hi',
            insertedAt: '2024-03-01T04:22:01.025641Z',
            messageNumber: 6,
            type: 'TEXT',
            status: 'sent',
            media: null,
            contact: {
              __typename: 'Contact',
              name: null,
            },
            errors: null,
            contextMessage: null,
          },
          {
            __typename: 'WaMessage',
            id: '8',
            body: 'test',
            insertedAt: '2024-03-01T04:19:33.241361Z',
            messageNumber: 5,
            type: 'TEXT',
            status: 'sent',
            media: null,
            contact: {
              __typename: 'Contact',
              name: null,
            },
            errors: null,
            contextMessage: null,
          },
          {
            __typename: 'WaMessage',
            id: '7',
            body: 'yes',
            insertedAt: '2024-03-01T04:17:46.550821Z',
            messageNumber: 4,
            type: 'TEXT',
            status: 'sent',
            media: null,
            contact: {
              __typename: 'Contact',
              name: null,
            },
            errors: null,
            contextMessage: null,
          },
          {
            __typename: 'WaMessage',
            id: '6',
            body: 'hi',
            insertedAt: '2024-03-01T04:15:06.179437Z',
            messageNumber: 3,
            type: 'TEXT',
            status: 'sent',
            media: null,
            contact: {
              __typename: 'Contact',
              name: null,
            },
            errors: null,
            contextMessage: null,
          },
          {
            __typename: 'WaMessage',
            id: '5',
            body: 'testing',
            insertedAt: '2024-03-01T04:14:30.367679Z',
            messageNumber: 2,
            type: 'TEXT',
            status: 'sent',
            media: null,
            contact: {
              __typename: 'Contact',
              name: null,
            },
            errors: null,
            contextMessage: null,
          },
          {
            __typename: 'WaMessage',
            id: '4',
            body: 'heyy',
            insertedAt: '2024-03-01T04:14:18.374720Z',
            messageNumber: 1,
            type: 'TEXT',
            status: 'received',
            media: null,
            contact: {
              __typename: 'Contact',
              name: 'akansha',
            },
            errors: null,
            contextMessage: null,
          },
        ],
      },
      {
        __typename: 'WaConversation',
        waGroup: {
          __typename: 'WaGroup',
          bspId: '973188435688999627@g.us',
          id: '2',
          label: 'West Virginia enchanters',
          lastCommunicationAt: '2024-03-01T03:54:27Z',
          waManagedPhone: {
            __typename: 'WaManagedPhone',
            id: '2',
            label: null,
            phone: '7962067080',
            phoneId: 6462,
          },
        },
        messages: [
          {
            __typename: 'WaMessage',
            id: '3',
            body: 'This above all: to thine own self be true.',
            insertedAt: '2024-03-01T03:54:26.600000Z',
            messageNumber: 1,
            type: 'TEXT',
            status: 'sent',
            media: null,
            contact: {
              __typename: 'Contact',
              name: 'Default receiver',
            },
            errors: null,
            contextMessage: null,
          },
        ],
      },
      {
        __typename: 'WaConversation',
        waGroup: {
          __typename: 'WaGroup',
          bspId: '726520535682795020@g.us',
          id: '1',
          label: 'Maryland wolves',
          lastCommunicationAt: '2024-03-01T03:54:27Z',
          waManagedPhone: {
            __typename: 'WaManagedPhone',
            id: '1',
            label: null,
            phone: '8181403577',
            phoneId: 1832,
          },
        },
        messages: [
          {
            __typename: 'WaMessage',
            id: '2',
            body: "The play 's the thing wherein I'll catch the conscience of the king.",
            insertedAt: '2024-03-01T03:54:26.600000Z',
            messageNumber: 2,
            type: 'TEXT',
            status: 'received',
            media: null,
            contact: {
              __typename: 'Contact',
              name: 'Default receiver',
            },
            errors: null,
            contextMessage: null,
          },
          {
            __typename: 'WaMessage',
            id: '1',
            body: 'Rich gifts wax poor when givers prove unkind.',
            insertedAt: '2024-03-01T03:54:26.599997Z',
            messageNumber: 1,
            type: 'TEXT',
            status: 'received',
            media: null,
            contact: {
              __typename: 'Contact',
              name: 'Default receiver',
            },
            errors: null,
            contextMessage: null,
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

const wrapper = (
  <ApolloProvider client={client}>
    <MemoryRouter>
      <GroupChatInterface />
    </MemoryRouter>
  </ApolloProvider>
);

// set user session
setUserSession(JSON.stringify({ organization: { id: '1' } }));

describe('<GroupChatInterface />', () => {
  test('it should render <GroupChatInterface /> component correctly', async () => {
    const { getByText } = render(wrapper);
    expect(getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(getByText('No messages.')).toBeInTheDocument();
    });
  });
});
