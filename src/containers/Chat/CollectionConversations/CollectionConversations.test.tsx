import { BrowserRouter as Router } from 'react-router-dom';
import { render, cleanup, waitFor, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';

import { SEARCH_QUERY } from 'graphql/queries/Search';
import { DEFAULT_ENTITY_LIMIT, DEFAULT_MESSAGE_LIMIT } from 'common/constants';
import CollectionConversations from './CollectionConversations';

const cache = new InMemoryCache({ addTypename: false });
cache.writeQuery({
  query: SEARCH_QUERY,
  variables: {
    contactOpts: { limit: DEFAULT_ENTITY_LIMIT },
    filter: { searchGroup: true },
    messageOpts: { limit: DEFAULT_MESSAGE_LIMIT },
  },
  data: {
    search: [
      {
        id: 'group_2',
        group: {
          id: '2',
          label: 'Default Collection',
        },
        contact: null,
        messages: [
          {
            id: '1',
            body: 'Hey there whats up?',
            insertedAt: '2020-06-25T13:36:43Z',
            messageNumber: 0,
            location: null,
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
      {
        id: 'group_3',
        group: {
          id: '3',
          label: 'Optin Collection',
        },
        contact: null,
        messages: [],
      },
      {
        id: 'group_4',
        group: {
          id: '4',
          label: 'Optout Collection',
        },
        contact: null,
        messages: [],
      },
      {
        id: 'group_5',
        group: {
          id: '5',
          label: 'Glific Collection',
        },
        contact: null,
        messages: [],
      },
      {
        id: 'group_1',
        group: {
          id: '1',
          label: 'Test Collection',
        },
        contact: null,
        messages: [],
      },
    ],
  },
});

const client = new ApolloClient({
  cache: cache,
  uri: 'http://localhost:4000/',
  assumeImmutableResults: true,
});

afterEach(cleanup);

const props = {
  searchVal: 'opt',
  searchMode: false,
  searchParam: {},
};

const collectionConversation = (
  <ApolloProvider client={client}>
    <Router>
      <CollectionConversations collectionId={3} {...props} />
    </Router>
  </ApolloProvider>
);

describe('<CollectionConversation />', () => {
  test('it should render <CollectionConversations /> component correctly', async () => {
    const { container } = render(collectionConversation);
    await waitFor(() => {
      expect(container).toBeInTheDocument();
    });
  });

  test('It should render search bar and perform its actions', async () => {
    const { container, getByTestId } = render(collectionConversation);
    await waitFor(() => {
      expect(container).toBeInTheDocument();
    });

    expect(screen.getByTestId('searchForm')).toBeInTheDocument();

    await waitFor(() => {
      const searchInput = screen.getByRole('textbox');
      expect(searchInput).toBeInTheDocument();
      userEvent.type(searchInput, 'opt');
      fireEvent.submit(getByTestId('searchForm'));

      // type optin then press enter
      userEvent.type(searchInput, 'optin{enter}');

      const resetButton = screen.getByTestId('resetButton');
      expect(resetButton).toBeInTheDocument();
      userEvent.click(resetButton);
    });

    const listItems = screen.getAllByTestId('list');
    expect(listItems.length).toBe(5);

    userEvent.click(listItems[0]);

    await waitFor(() => {});
  });
});
