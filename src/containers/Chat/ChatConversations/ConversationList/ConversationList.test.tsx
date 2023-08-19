import { BrowserRouter as Router } from 'react-router-dom';
import { render, waitFor, screen, fireEvent } from '@testing-library/react';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing';

import { searchContactCollection } from 'mocks/Search';
import ConversationList from './ConversationList';
import {
  contact,
  collection,
  collectionWithLoadMore,
} from 'containers/Chat/ChatMessages/ChatMessages.test';
import { conversationCollectionQuery } from 'mocks/Chat';
import { cache as collectionCache } from 'config/apolloclient';

const contactCache = new InMemoryCache({ addTypename: false });
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
    <MockedProvider
      cache={collectionCacheWithSearch}
      addTypename={false}
      mocks={searchCollectionMocks}
    >
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

const contactProps: any = {
  searchVal: 'III',
  selectedContactId: 216,
  setSelectedContactId: vi.fn(),
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
  });

  await waitFor(() => {
    const listItems = screen.getAllByTestId('list');
    expect(listItems.length).toBe(35);
    fireEvent.click(listItems[0]);
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
