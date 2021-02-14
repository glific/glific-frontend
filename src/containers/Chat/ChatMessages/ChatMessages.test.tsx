import React from 'react';
import { render } from '@testing-library/react';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { ChatMessages } from './ChatMessages';
import { fireEvent, waitFor } from '@testing-library/dom';
import { MemoryRouter } from 'react-router';
import { SEARCH_QUERY } from '../../../graphql/queries/Search';

const cache = new InMemoryCache({ addTypename: false });
export const searchQuery = {
  query: SEARCH_QUERY,
  variables: {
    filter: {},
    contactOpts: { limit: 25 },
    messageOpts: { limit: 20 },
  },
  data: {
    search: [
      {
        group: null,
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
            errors: '{}',
          },
        ],
      },
    ],
  },
};

cache.writeQuery(searchQuery);

// add collection to apollo cache
cache.writeQuery({
  query: SEARCH_QUERY,
  variables: {
    filter: { searchGroup: true },
    contactOpts: { limit: 25 },
    messageOpts: { limit: 20 },
  },
  data: {
    search: [
      {
        group: {
          id: '2',
          label: 'Default Group',
        },
        contact: null,
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
              id: '1',
            },
            tags: null,
            type: 'TEXT',
            media: null,
            errors: '{}',
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
window.HTMLElement.prototype.scrollIntoView = jest.fn();

const chatMessages = (
  <MemoryRouter>
    <ApolloProvider client={client}>
      <ChatMessages contactId={'2'} />
    </ApolloProvider>
  </MemoryRouter>
);

it('should have title as contact name', async () => {
  const { getByTestId } = render(chatMessages);
  await waitFor(() => {
    expect(getByTestId('beneficiaryName')).toHaveTextContent('Effie Cormier');
  });
});

it('should have an emoji picker', async () => {
  const { getByTestId } = render(chatMessages);
  await waitFor(() => {
    expect(getByTestId('emoji-picker')).toBeInTheDocument();
  });
});

it('should contain the mock message', async () => {
  const { getByText } = render(chatMessages);
  await waitFor(() => {
    expect(getByText('Hey there whats up?')).toBeInTheDocument();
  });
});

test('click on assign tag should open a dialog box with already assigned tags', async () => {
  const { getByTestId } = render(chatMessages);
  await waitFor(() => {
    fireEvent.click(getByTestId('messageOptions'));
  });

  fireEvent.click(getByTestId('dialogButton'));

  await waitFor(() => {
    expect(getByTestId('dialogBox')).toHaveTextContent('Assign tag to message');
  });
});

// need to check how to mock these

// test('assigned tags should be shown in searchbox', async () => {
//   const { getByTestId } = render(chatMessages);
//   await waitFor(() => {
//     fireEvent.click(getByTestId('messageOptions'));
//   });

//   fireEvent.click(getByTestId('dialogButton'));

//   await waitFor(() => {
//     const searchBox = within(getByTestId('AutocompleteInput'));
//     expect(searchBox.getByText('Search')).toBeInTheDocument();
//   });
// });

// test('remove already assigned tags', async () => {
//   const { getByTestId } = render(chatMessages);
//   await wait();
//   await wait();
//   fireEvent.click(getByTestId('messageOptions'));
//   await wait();
//   act(() => {
//     fireEvent.click(getByTestId('dialogButton'));
//   });
//   await wait();
//   const searchBox = within(getByTestId('AutocompleteInput'));
//   fireEvent.click(searchBox.getByTestId('deleteIcon'));
// });

test('focus on the latest message', async () => {
  const { getByTestId } = render(chatMessages);
  await waitFor(() => {
    const message = getByTestId('message');
    expect(message.scrollIntoView).toBeCalled();
  });
});

test('cancel after dialog box open', async () => {
  const { getByText, getByTestId } = render(chatMessages);
  await waitFor(() => {
    fireEvent.click(getByTestId('messageOptions'));
    fireEvent.click(getByTestId('dialogButton'));
  });

  fireEvent.click(getByText('Cancel'));
});

const chatMessagesWithCollection = (
  <MemoryRouter>
    <ApolloProvider client={client}>
      <ChatMessages collectionId="2" />
    </ApolloProvider>
  </MemoryRouter>
);

it('should have title as group name', async () => {
  const { getByTestId } = render(chatMessagesWithCollection);
  await waitFor(() => {
    expect(getByTestId('beneficiaryName')).toHaveTextContent('Default Group');
  });
});
