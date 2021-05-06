import { BrowserRouter as Router } from 'react-router-dom';
import { render, waitFor, screen, fireEvent, prettyDOM } from '@testing-library/react';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';

import ConversationList from './ConversationList';
import { searchQuery, collection } from '../../ChatMessages/ChatMessages.test';
import { searchContactCollection } from '../../../../mocks/Search';
import { MockedProvider } from '@apollo/client/testing';

jest.mock('react-i18next', () => ({
  // this mock makes sure any components using the translate hook can use it without a warning being shown
  useTranslation: () => {
    return {
      t: (str: string) => str,
      i18n: {
        changeLanguage: () => new Promise(() => {}),
      },
    };
  },
}));

const contactCache = new InMemoryCache({ addTypename: false });
contactCache.writeQuery(searchQuery);

const clientForContact = new ApolloClient({
  cache: contactCache,
  assumeImmutableResults: true,
});
const conversationList = (
  <ApolloProvider client={clientForContact}>
    <Router>
      <ConversationList
        searchVal="f"
        selectedContactId={2}
        setSelectedContactId={jest.fn()}
        savedSearchCriteria=""
        searchMode={false}
        searchParam={{}}
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
  expect(listItems.length).toBe(1);
});

const props = {
  searchVal: '',
  searchMode: false,
  searchParam: {},
  selectedCollectionId: '2',
  setSelectedCollectionId: jest.fn(),
  entityType: 'collection',
};
const collectionCache = new InMemoryCache({ addTypename: false });
collectionCache.writeQuery(collection);

const clientForCollection = new ApolloClient({
  cache: collectionCache,
  assumeImmutableResults: true,
});

test('it should render conversation collection list', async () => {
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
    expect(listItems.length).toBe(25);
    fireEvent.click(listItems[0]);
  });

  await waitFor(() => {
    const loadMore = screen.getByText('Load more');
    expect(loadMore).toBeInTheDocument();
    fireEvent.click(loadMore);
  });
});

test('it should render conversation collection list with searched value', async () => {
  props.searchVal = 'test';
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
    expect(listItems.length).toBe(25);
    fireEvent.click(listItems[0]);
  });

  // await waitFor(() => {
  //   const loadMore = screen.getByText('Load more');
  //   expect(loadMore).toBeInTheDocument();
  //   fireEvent.click(loadMore);
  // });
});

const contactCollectionList = (
  <MockedProvider mocks={[searchContactCollection]} addTypename={false}>
    <Router>
      <ConversationList
        searchVal="III"
        selectedContactId={216}
        setSelectedContactId={jest.fn()}
        savedSearchCriteria=""
        searchMode={false}
        searchParam={{}}
      />
    </Router>
  </MockedProvider>
);

test('It render contact collection with multi-search', async () => {
  const { container } = render(contactCollectionList);

  await waitFor(() => {
    expect(container).toBeInTheDocument();
  });
});
