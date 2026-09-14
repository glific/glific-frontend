import { MemoryRouter, BrowserRouter as Router } from 'react-router';
import { render, waitFor, screen, fireEvent } from '@testing-library/react';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing';

import { messages, searchContactCollection } from 'mocks/Search';
import { DEFAULT_ENTITY_LIMIT, DEFAULT_MESSAGE_LIMIT, MESSAGE_CHANNELS } from 'common/constants';
import { SEARCH_QUERY } from 'graphql/queries/Search';
import ConversationList from './ConversationList';

import { conversationCollectionQuery } from 'mocks/Chat';
import { cache as collectionCache } from 'config/apolloclient';
import { searchGroupQuery, waGroup } from 'mocks/Groups';
import { collection, collectionWithLoadMore, contact } from 'containers/Chat/ChatMessages/ChatMessages.test';

const contactCache = new InMemoryCache({ addTypename: false });
const groupsCache = new InMemoryCache({ addTypename: false });

contactCache.writeQuery(contact);

const clientForContact = new ApolloClient({
  cache: contactCache,
  uri: 'http://localhost:4000/',
  assumeImmutableResults: true,
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
  uri: 'http://localhost:4000/',
  assumeImmutableResults: true,
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

const collectionCacheWithSearch = new InMemoryCache({ addTypename: false });
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
    <MockedProvider cache={collectionCacheWithSearch} addTypename={false} mocks={searchCollectionMocks}>
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
    <MockedProvider mocks={searchContactCollection} addTypename={false}>
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
    <MockedProvider mocks={searchContactCollection} addTypename={false}>
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
  uri: 'http://localhost:4000/',
  assumeImmutableResults: true,
});

test('it renders whatsapp groups with phone number filter', async () => {
  const { getByText } = render(
    <ApolloProvider client={clientForGroup}>
      <MockedProvider mocks={searchGroupQuery} addTypename={false}>
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
  const { getByText } = render(
    <MockedProvider mocks={searchGroupQuery} addTypename={false}>
      <MemoryRouter initialEntries={[route]}>
        <ConversationList {...propsForGroups} />
      </MemoryRouter>
    </MockedProvider>
  );

  expect(getByText('Loading...')).toBeInTheDocument();

  await waitFor(async () => {
    const listItems = screen.getAllByTestId('list');
    expect(listItems.length).toBe(6);
    fireEvent.click(listItems[0]);
  });
});

describe('filtering by channel', () => {
  const conversation = (id: string, name: string, channel: string, body: string) => ({
    id: `contact_${id}`,
    group: null,
    contact: {
      id,
      name,
      phone: `9876543${id}`,
      maskedPhone: `98****3${id}`,
      lastMessageAt: new Date(),
      status: 'VALID',
      fields: '{}',
      bspStatus: 'SESSION_AND_HSM',
      isOrgRead: true,
      isWebOnline: false,
    },
    messages: messages(2, Number(id) * 10, channel, body),
  });

  const mixedCache = new InMemoryCache({ addTypename: false });
  mixedCache.writeQuery({
    query: SEARCH_QUERY,
    variables: {
      filter: {},
      contactOpts: { limit: DEFAULT_ENTITY_LIMIT },
      messageOpts: { limit: DEFAULT_MESSAGE_LIMIT },
    },
    data: {
      search: [
        conversation('4', 'Whatsapp Person', MESSAGE_CHANNELS.whatsapp, 'sent over whatsapp'),
        conversation('5', 'Browser Person', MESSAGE_CHANNELS.web, 'sent from a browser'),
      ],
    },
  });

  const mixedClient = new ApolloClient({
    cache: mixedCache,
    uri: 'http://localhost:4000/',
    assumeImmutableResults: true,
  });

  const renderWithChannel = (channel: any) =>
    render(
      <ApolloProvider client={mixedClient}>
        <Router>
          <ConversationList
            searchVal=""
            selectedContactId={4}
            setSelectedContactId={vi.fn()}
            savedSearchCriteria=""
            searchMode={false}
            searchParam={{}}
            entityType="contact"
            channel={channel}
          />
        </Router>
      </ApolloProvider>
    );

  // The reported bug: a conversation held in the browser was showing up in the WhatsApp view.
  test('a web conversation does not appear in the WhatsApp view', async () => {
    renderWithChannel(MESSAGE_CHANNELS.whatsapp);

    await waitFor(() => expect(screen.getByText('Whatsapp Person')).toBeInTheDocument());

    expect(screen.queryByText('Browser Person')).not.toBeInTheDocument();
  });

  test('a WhatsApp conversation does not appear in the web view', async () => {
    renderWithChannel(MESSAGE_CHANNELS.web);

    await waitFor(() => expect(screen.getByText('Browser Person')).toBeInTheDocument());

    expect(screen.queryByText('Whatsapp Person')).not.toBeInTheDocument();
  });

  // The 24 hour window is a WhatsApp construct, so a countdown on a web card is a number that
  // means nothing — the card shows whether the person still has the widget open instead.
  test('a web card shows presence where a WhatsApp card shows the session timer', async () => {
    renderWithChannel(MESSAGE_CHANNELS.web);

    await waitFor(() => expect(screen.getByText('Browser Person')).toBeInTheDocument());

    expect(screen.getByTestId('presenceIndicator')).toBeInTheDocument();
    expect(screen.queryByTestId('timerCount')).not.toBeInTheDocument();
  });

  test('a WhatsApp card keeps its session timer', async () => {
    renderWithChannel(MESSAGE_CHANNELS.whatsapp);

    await waitFor(() => expect(screen.getByText('Whatsapp Person')).toBeInTheDocument());

    expect(screen.queryByTestId('presenceIndicator')).not.toBeInTheDocument();
  });

  // With the flag off no channel is passed at all, and the inbox must look exactly as it did.
  test('both appear when no channel is selected', async () => {
    renderWithChannel(undefined);

    await waitFor(() => expect(screen.getByText('Whatsapp Person')).toBeInTheDocument());

    expect(screen.getByText('Browser Person')).toBeInTheDocument();
  });
});
