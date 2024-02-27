import { MemoryRouter } from 'react-router';
import GroupChatInterface from './GroupChatInterface';
import { render, screen, waitFor } from '@testing-library/react';
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
        __typename: 'WaConversation',
        messages: [
          {
            __typename: 'WaMessage',
            body: 'testing',
            id: '7',
            insertedAt: '2024-02-26T15:14:37.523972Z',
            status: 'sent',
          },
          {
            __typename: 'WaMessage',
            body: 'Rich gifts wax poor when givers prove unkind.',
            id: '2',
            insertedAt: '2024-02-26T15:10:57.527307Z',
            status: 'received',
          },
        ],
        waGroup: {
          __typename: 'WaGroup',
          bspId: '512053299558654923@g.us',
          id: '1',
          label: 'West Virginia oracles',
          lastCommunicationAt: '2024-02-26T16:51:19Z',
          waManagedPhone: {
            __typename: 'WaManagedPhone',
            id: '1',
            label: null,
            phone: '6265104163',
            phoneId: 6640,
          },
        },
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
    screen.debug();
    // check if group chat conversations are displayed
    await waitFor(() => {
      expect(getByText('Maytapi Testing')).toBeInTheDocument();
    });
  });
});
