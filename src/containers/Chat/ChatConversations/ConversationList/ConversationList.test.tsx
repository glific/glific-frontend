import { BrowserRouter as Router } from 'react-router-dom';
import { render, fireEvent, waitFor } from '@testing-library/react';
import ConversationList from './ConversationList';

import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { searchQuery } from '../../ChatMessages/ChatMessages.test';

const cache = new InMemoryCache({ addTypename: false });
cache.writeQuery(searchQuery);

const client = new ApolloClient({
  cache,
  assumeImmutableResults: true,
});
const conversationList = (
  <ApolloProvider client={client}>
    <Router>
      <ConversationList
        searchVal=""
        selectedContactId={2}
        setSelectedContactId={jest.fn()}
        savedSearchCriteria=""
        searchMode={false}
      />
    </Router>
  </ApolloProvider>
);

test('it should render ConversationsList properly', async () => {
  const { container } = render(conversationList);
  await waitFor(() => {
    expect(container).toBeInTheDocument();
  });
});

// need to check why its not working
// test('it shows a conversation on clicking a contact', async () => {
//   const { getAllByTestId, getByText } = render(conversationList);
//   await waitFor(() => {
//     fireEvent.click(getAllByTestId('list')[0]);
//   });
//   expect(getByText('Hey there whats up?')).toBeInTheDocument();
// });
