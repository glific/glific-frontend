import { MemoryRouter, BrowserRouter as Router } from 'react-router';
import { render, waitFor, screen, fireEvent } from '@testing-library/react';
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { LocalState } from '@apollo/client/local-state';
import { ApolloProvider } from '@apollo/client/react';
import { MockedProvider } from '@apollo/client/testing/react';

import { searchContactCollection } from 'mocks/Search';
import ConversationList from './ConversationList';

import { conversationCollectionQuery } from 'mocks/Chat';
import { cache as collectionCache } from 'config/apolloclient';
import { searchGroupQuery, waGroup } from 'mocks/Groups';
import { collection, collectionWithLoadMore, contact } from 'containers/Chat/ChatMessages/ChatMessages.test';
import { SEARCH_MULTI_QUERY } from 'graphql/queries/Search';
import { DEFAULT_ENTITY_LIMIT, DEFAULT_MESSAGE_LIMIT, DEFAULT_MESSAGE_LOADMORE_LIMIT } from 'common/constants';

const contactCache = new InMemoryCache({});
const groupsCache = new InMemoryCache({});

contactCache.writeQuery(contact);

const clientForContact = new ApolloClient({
  cache: contactCache,
  link: new HttpLink({ uri: 'http://localhost:4000/' }),
  assumeImmutableResults: true,
  localState: new LocalState(),
});
const conversationList = (
  <ApolloProvider client={clientForContact}>
    <Router>
      <ConversationList
        searchVal=""
        selectedContactId={2}
        setSelectedContactId={vi.fn()}
        savedSearchCriteria=""
        searchMode={false}
        searchParam={{}}
        entityType="contact"
      />
    </Router>
  </ApolloProvider>
);

test('it should render ConversationsList properly', async () => {
  const { container } = render(conversationList);
  await waitFor(() => {
    expect(container).toBeInTheDocument();
  });

  const listItems = screen.getAllByTestId('list');
  expect(listItems.length).toBe(2);
});

const props: any = {
  searchVal: '',
  searchMode: false,
  searchParam: {},
  selectedCollectionId: '2',
  setSelectedCollectionId: vi.fn(),
  entityType: 'collection',
};

collectionCache.writeQuery(collection);
collectionCache.writeQuery(collectionWithLoadMore);

const clientForCollection = new ApolloClient({
  cache: collectionCache,
  link: new HttpLink({ uri: 'http://localhost:4000/' }),
  assumeImmutableResults: true,
  localState: new LocalState(),
});

test('it should render conversation collection list with readMore', async () => {
  const { container } = render(
    <ApolloProvider client={clientForCollection}>
      <Router>
        <ConversationList {...props} />
      </Router>
    </ApolloProvider>
  );

  expect(container).toBeInTheDocument();
  await waitFor(() => {
    const listItems = screen.getAllByTestId('list');
    expect(listItems.length).toBe(31);
    fireEvent.click(listItems[0]);
  });

  await waitFor(() => {
    const loadMore = screen.getByText('Load more');
    expect(loadMore).toBeInTheDocument();
    fireEvent.click(loadMore);
  });
});

const collectionCacheWithSearch = new InMemoryCache({});
collectionCacheWithSearch.writeQuery(collection);

const searchCollectionMocks = [
  conversationCollectionQuery('2', 'Test collection', {
    searchGroup: true,
    groupLabel: 'test',
  }),
  conversationCollectionQuery('2', 'Test collection'),
];

test('it should render conversation collection list with searched value', async () => {
  props.searchVal = 'test';
  props.savedSearchCriteriaId = '2';

  const { container } = render(
    <MockedProvider cache={collectionCacheWithSearch} mocks={searchCollectionMocks}>
      <Router>
        <ConversationList {...props} />
      </Router>
    </MockedProvider>
  );

  await waitFor(() => {
    expect(container).toBeInTheDocument();
    const listItems = screen.getAllByTestId('list');
    expect(listItems.length).toBe(1);
    expect(screen.getByText('Test collection')).toBeInTheDocument();
    fireEvent.click(listItems[0]);
  });
});

const setSelectedContactIdMock = vi.fn();

const contactProps: any = {
  searchVal: 'III',
  selectedContactId: 216,
  setSelectedContactId: setSelectedContactIdMock,
  searchMode: false,
  searchParam: {},
  entityType: 'contact',
};

test('It render contact collection with multi-search', async () => {
  const { container } = render(
    <MockedProvider mocks={searchContactCollection}>
      <Router>
        <ConversationList {...contactProps} />
      </Router>
    </MockedProvider>
  );

  await waitFor(() => {
    expect(container).toBeInTheDocument();
    expect(screen.getAllByTestId('list')[0]).toBeInTheDocument();
  });
  const listItems = screen.getAllByTestId('list');

  await waitFor(() => {
    expect(listItems.length).toBe(35);
  });

  fireEvent.click(listItems[0]);

  await waitFor(() => {
    expect(setSelectedContactIdMock).toHaveBeenCalled();
  });
});

test('It render contact collection with no result', async () => {
  contactProps.searchVal = '';
  const { container } = render(
    <MockedProvider mocks={searchContactCollection}>
      <Router>
        <ConversationList {...contactProps} />
      </Router>
    </MockedProvider>
  );

  await waitFor(() => {
    expect(container).toBeInTheDocument();
  });
});

groupsCache.writeQuery(waGroup);

let propsForGroups: any = {
  searchVal: '',
  savedSearchCriteria: '',
  selectedContactId: 6,
  setSelectedContactId: vi.fn(),
  searchMode: false,
  searchParam: {},
  entityType: 'contact',
};

let route = '/group/chat';

const clientForGroup = new ApolloClient({
  cache: groupsCache,
  link: new HttpLink({ uri: 'http://localhost:4000/' }),
  assumeImmutableResults: true,
  localState: new LocalState(),
});

test('it renders whatsapp groups with phone number filter', async () => {
  const { getByText } = render(
    <ApolloProvider client={clientForGroup}>
      <MockedProvider mocks={searchGroupQuery}>
        <MemoryRouter initialEntries={[route]}>
          <ConversationList {...propsForGroups} phonenumber={[{ label: '96276736', id: '1' }]} />
        </MemoryRouter>
      </MockedProvider>
    </ApolloProvider>
  );

  expect(getByText('Loading...')).toBeInTheDocument();

  await waitFor(async () => {
    const listItems = screen.getAllByTestId('list');
    expect(listItems[0]).toHaveTextContent('Oklahoma sheep');
  });
});

test('it renders whatsapp groups for multi search', async () => {
  propsForGroups = {
    ...propsForGroups,
    searchVal: 'group 2',
  };
  render(
    <MockedProvider mocks={searchGroupQuery}>
      <MemoryRouter initialEntries={[route]}>
        <ConversationList {...propsForGroups} />
      </MemoryRouter>
    </MockedProvider>
  );

  await waitFor(async () => {
    const listItems = screen.getAllByTestId('list');
    expect(listItems.length).toBe(6);
    fireEvent.click(listItems[0]);
  });
});

const buildMultiSearchMessage = (id: number, term: string) => ({
  id: `${id}`,
  body: `Please check this ${id} - ${term}`,
  messageNumber: id,
  insertedAt: '2021-05-05T05:40:02.434957Z',
  contact: {
    id: `${id}`,
    name: `Contact ${id}`,
    phone: '+919090909090',
    maskedPhone: '9090******90',
    lastMessageAt: '2021-05-03T04:56:38Z',
    status: 'VALID',
    bspStatus: 'NONE',
  },
  receiver: { id: '1' },
  sender: { id: '1' },
  type: 'TEXT',
  media: null,
  contextMessage: null,
  flowLabel: null,
});

const multiSearchTerm = 'loadmoreterm';

const multiSearchRequestVariables = (offset: number, limit: number) => ({
  contactOpts: { limit: DEFAULT_ENTITY_LIMIT, order: 'DESC' },
  searchFilter: { term: multiSearchTerm },
  messageOpts: { limit, offset, order: 'ASC' },
});

// exercises loadMoreMessages()'s multi-search branch in ConversationList.tsx: appending
// additional messages, an errored request (caught by `.catch`), and finally an empty page that
// flips `showLoadMore` off.
test('multi-search load more: appends messages, recovers from an error, then exhausts results', async () => {
  const initialMultiSearchMock = {
    request: {
      query: SEARCH_MULTI_QUERY,
      variables: multiSearchRequestVariables(0, DEFAULT_MESSAGE_LIMIT),
    },
    result: {
      data: {
        searchMulti: {
          contacts: [],
          messages: Array.from({ length: 20 }, (_, i) => buildMultiSearchMessage(i + 1, multiSearchTerm)),
          labels: [],
        },
      },
    },
  };

  const appendMultiSearchMock = {
    request: {
      query: SEARCH_MULTI_QUERY,
      variables: multiSearchRequestVariables(20, DEFAULT_MESSAGE_LOADMORE_LIMIT),
    },
    result: {
      data: {
        searchMulti: {
          contacts: [],
          messages: [buildMultiSearchMessage(21, multiSearchTerm)],
          labels: [],
        },
      },
    },
  };

  const erroredMultiSearchMock = {
    request: {
      query: SEARCH_MULTI_QUERY,
      variables: multiSearchRequestVariables(21, DEFAULT_MESSAGE_LOADMORE_LIMIT),
    },
    error: new Error('Network error'),
  };

  const emptyMultiSearchMock = {
    request: {
      query: SEARCH_MULTI_QUERY,
      variables: multiSearchRequestVariables(21, DEFAULT_MESSAGE_LOADMORE_LIMIT),
    },
    result: {
      data: {
        searchMulti: {
          contacts: [],
          messages: [],
          labels: [],
        },
      },
    },
  };

  const multiSearchLoadMoreProps: any = {
    searchVal: multiSearchTerm,
    searchMode: false,
    searchParam: {},
    entityType: 'contact',
  };

  render(
    <MockedProvider
      mocks={[initialMultiSearchMock, appendMultiSearchMock, erroredMultiSearchMock, emptyMultiSearchMock]}
    >
      <Router>
        <ConversationList {...multiSearchLoadMoreProps} />
      </Router>
    </MockedProvider>
  );

  // 20 messages > DEFAULT_MESSAGE_LIMIT - 1 makes the "Load more" button render
  await waitFor(() => {
    expect(screen.getByText('Load more')).toBeInTheDocument();
  });

  // click 1: a non-empty response appends to the existing multi-search messages
  fireEvent.click(screen.getByText('Load more'));
  await waitFor(() => {
    expect(screen.getByText('Load more')).toBeInTheDocument();
  });

  // click 2: a network error is swallowed by `.catch`, leaving `showLoadMore` untouched
  fireEvent.click(screen.getByText('Load more'));
  await waitFor(() => {
    expect(screen.getByText('Load more')).toBeInTheDocument();
  });

  // click 3: an empty page sets `showLoadMore(false)`, hiding the "Load more" button
  fireEvent.click(screen.getByText('Load more'));
  await waitFor(() => {
    expect(screen.queryByText('Load more')).not.toBeInTheDocument();
  });
});
