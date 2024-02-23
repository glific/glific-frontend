import { MemoryRouter } from 'react-router';
import GroupChatInterface from './GroupChatInterface';
import { render, waitFor } from '@testing-library/react';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { SEARCH_QUERY } from 'graphql/queries/Search';
import { DEFAULT_CONTACT_LIMIT, DEFAULT_MESSAGE_LIMIT } from 'common/constants';
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
const wrapper = (
  <ApolloProvider client={client}>
    <MemoryRouter>
      <GroupChatInterface />
    </MemoryRouter>
  </ApolloProvider>
);

describe('<GroupChatInterface />', () => {
  test('it should render <GroupChatInterface /> component correctly', async () => {
    const { getByText, findByTestId } = render(wrapper);

    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();

    // check if group chat conversations are displayed
    await waitFor(() => {
      expect(getByText('Maytapi Testing')).toBeInTheDocument();
    });
  });
});
