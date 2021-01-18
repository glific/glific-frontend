import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { render, wait, fireEvent, waitFor } from '@testing-library/react';
import ConversationList from './ConversationList';

import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { SEARCH_QUERY } from '../../../../graphql/queries/Search';

const cache = new InMemoryCache({ addTypename: false });
cache.writeQuery({
  query: SEARCH_QUERY,
  variables: {
    filter: {},
    messageOpts: { limit: 50 },
    contactOpts: { limit: 50 },
  },
  data: {
    search: [
      {
        contact: {
          id: '2',
          name: 'Effie Cormier',
          phone: '987654321',
          maskedPhone: '98****321',
          lastMessageAt: '2020-06-29T09:31:47Z',
          status: 'VALID',
          bspStatus: 'SESSION_AND_HSM',
        },
        messages: [
          {
            id: '1',
            body: 'Hey there whats up?',
            insertedAt: '2020-06-25T13:36:43Z',
            location: null,
            receiver: {
              id: '1',
            },
            sender: {
              id: '2',
            },
            tags: [
              {
                id: '1',
                label: 'important',
                colorCode: '#00d084',
              },
            ],
            type: 'TEXT',
            media: null,
          },
        ],
      },
    ],
  },
});

const client = new ApolloClient({
  cache: cache,
  assumeImmutableResults: true,
});
const conversationList = (
  <ApolloProvider client={client}>
    <Router>
      <ConversationList
        searchVal=""
        selectedContactId={3}
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

test('it shows a conversation on clicking a contact', async () => {
  const { getAllByTestId, getByText } = render(conversationList);
  await waitFor(() => {
    fireEvent.click(getAllByTestId('list')[0]);
  });
  expect(getByText('Restricted Group message body')).toBeInTheDocument();
});
