import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { render, waitFor, fireEvent, cleanup } from '@testing-library/react';
import ChatConversations from './ChatConversations';

import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { searchQuery } from '../ChatMessages/ChatMessages.test';

const cache = new InMemoryCache({ addTypename: false });
cache.writeQuery(searchQuery);

const client = new ApolloClient({
  cache,
  assumeImmutableResults: true,
});

afterEach(cleanup);
const chatConversation = (
  <ApolloProvider client={client}>
    <Router>
      <ChatConversations
        contactId={2}
        simulator={{ simulatorId: '1', setShowSimulator: jest.fn() }}
      />
    </Router>
  </ApolloProvider>
);

test('it should render <ChatConversations /> component correctly', async () => {
  const { container } = render(chatConversation);
  await waitFor(() => {
    expect(container).toBeInTheDocument();
  });
});

test('it should filter contacts based on search', async () => {
  const { getByTestId } = render(chatConversation);
  await waitFor(() => {
    fireEvent.change(getByTestId('searchInput').querySelector('input'), { target: { value: 'a' } });
  });
  fireEvent.submit(getByTestId('searchForm'));
});

// Checking if these tests checks anything

// test('it should reset input on clicking cross icon', async () => {
//   const { getByTestId, getByText } = render(chatConversation);
//   await waitFor(() => {
//     fireEvent.change(getByTestId('searchInput').querySelector('input'), { target: { value: 'a' } });
//   });
//   const resetButton = getByTestId('resetButton');
//   fireEvent.click(resetButton);

//   await waitFor(() => {
//     expect(getByText('Red Sparrow')).toBeInTheDocument();
//   });
// });

// test('it should load all contacts with unread tag', async () => {
//   const { getAllByTestId, getByText } = render(chatConversation);
//   await wait();
//   fireEvent.click(getAllByTestId('savedSearchDiv')[0]);
//   await wait();
//   await wait();
//   expect(getByText('You do not have any conversations.')).toBeInTheDocument();
// });
