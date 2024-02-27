import { MemoryRouter } from 'react-router-dom';
import { cleanup, render, screen } from '@testing-library/react';
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
    filter: {},
    waMessageOpts: { limit: DEFAULT_MESSAGE_LIMIT },
  },
  data: {
    search: [
      {
        __typename: 'WaConversation',
        messages: [
          {
            __typename: 'WaMessage',
            body: 'Hey there',
            contextMessage: null,
            errors: null,
            id: '171',
            insertedAt: '2024-02-27T18:52:58.647737Z',
            media: null,
            messageNumber: 6,
            status: 'received',
            type: 'TEXT',
          },
          {
            __typename: 'WaMessage',
            body: 'Hi',
            contextMessage: null,
            errors: null,
            id: '170',
            insertedAt: '2024-02-27T18:52:13.730475Z',
            media: null,
            messageNumber: 5,
            status: 'sent',
            type: 'TEXT',
          },
        ],
        waGroup: {
          __typename: 'WaGroup',
          bspId: '120363045200210610@g.us',
          id: '44',
          label: 'Maytapi Testing',
          lastMessageAt: '2024-02-27T18:53:44Z',
          waManagedPhone: {
            __typename: 'WaManagedPhone',
            id: '3',
            label: null,
            phone: '919425010449',
            phoneId: 45702,
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
    const { findByTestId } = render(wrapper);
    screen.debug();

    // check if chat conversations are displayed
    const ChatConversation = await findByTestId('beneficiaryName');
    expect(ChatConversation).toHaveTextContent('Maytapi Testing');
  });

  test('check condition when no subscription data provided', async () => {
    const { findByTestId } = render(wrapper);

    const ChatConversation = await findByTestId('beneficiaryName');
    expect(ChatConversation).toHaveTextContent('Maytapi Testing');
  });
});
