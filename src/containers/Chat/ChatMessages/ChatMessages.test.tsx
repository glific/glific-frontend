import { render, act, screen } from '@testing-library/react';
import 'mocks/matchMediaMock';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { fireEvent, waitFor } from '@testing-library/dom';
import { MemoryRouter, Route, Routes } from 'react-router';
import { BrowserRouter as Router } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { vi } from 'vitest';

import { ChatMessages } from './ChatMessages';
import { SEARCH_QUERY } from '../../../graphql/queries/Search';
import { DEFAULT_ENTITY_LIMIT, DEFAULT_MESSAGE_LIMIT } from '../../../common/constants';
import {
  CONVERSATION_MOCKS,
  loadMoreChats,
  mocksWithConversation,
  sendMessageMock,
} from '../../../mocks/Chat';
import { waGroup, waGroupcollection } from 'mocks/Groups';
import { userEvent } from '@testing-library/user-event';
import { setNotification } from 'common/notification';

vi.mock('common/notification', async (importOriginal) => {
  const mod = await importOriginal<typeof import('common/notification')>();
  return {
    ...mod,
    setNotification: vi.fn((...args) => {
      return args[1];
    }),
  };
});

const defineUrl = (url: string) => {
  Object.defineProperty(window, 'location', {
    value: {
      href: url,
    },
    writable: true,
  });
};

const body = {
  id: '1',
  body: 'Hey there whats up?',
  insertedAt: '2020-06-25T13:36:43Z',
  location: null,
  messageNumber: 48,
  receiver: {
    id: '1',
  },
  sender: {
    id: '2',
  },
  type: 'TEXT',
  media: null,
  errors: '{}',
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
};

const cache = new InMemoryCache({ addTypename: false });
export const searchQuery = {
  query: SEARCH_QUERY,
  variables: {
    filter: {},
    contactOpts: { limit: DEFAULT_ENTITY_LIMIT },
    messageOpts: { limit: DEFAULT_MESSAGE_LIMIT },
  },
  data: {
    search: [
      {
        id: 'contact_2',
        group: null,
        contact: {
          id: '2',
          name: 'Effie Cormier',
          phone: '987654321',
          maskedPhone: '98****321',
          lastMessageAt: new Date(),
          status: 'VALID',
          fields: '{}',
          bspStatus: 'SESSION_AND_HSM',
          isOrgRead: true,
        },
        messages: [body],
      },
    ],
  },
};

cache.writeQuery(searchQuery);

export const contact = {
  query: SEARCH_QUERY,
  variables: {
    filter: {},
    contactOpts: { limit: DEFAULT_ENTITY_LIMIT },
    messageOpts: { limit: DEFAULT_MESSAGE_LIMIT },
  },
  data: {
    search: [
      {
        id: 'contact_2',
        group: null,
        contact: {
          id: 2,
          name: 'Effie Cormier',
          phone: '987654321',
          maskedPhone: '98****321',
          lastMessageAt: new Date(),
          status: 'VALID',
          fields: '{}',
          bspStatus: 'SESSION_AND_HSM',
          isOrgRead: true,
        },
        messages: [body],
      },
      {
        id: 'contact_1',
        group: null,
        contact: {
          id: 1,
          name: '',
          phone: '1234567890',
          maskedPhone: '12****890',
          lastMessageAt: new Date(),
          status: 'VALID',
          fields: '{}',
          bspStatus: 'SESSION_AND_HSM',
          isOrgRead: true,
        },
        messages: [],
      },
    ],
  },
};

const conversationData = Array(30)
  .fill(null)
  .map((val: any, index: number) => ({
    id: `group_${index + 3}`,
    group: {
      id: `${index + 3}`,
      label: `Test ${index + 3}`,
    },
    contact: null,
    messages: [],
  }));

export const collection = {
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
          label: 'Default Group',
        },
        contact: null,
        messages: [
          {
            id: '1',
            body: 'Hey there whats up?',
            insertedAt: '2020-06-25T13:36:43Z',
            location: null,
            messageNumber: 48,
            receiver: {
              id: '1',
            },
            sender: {
              id: '1',
            },
            type: 'TEXT',
            media: null,
            errors: '{}',
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
      ...conversationData,
    ],
  },
};

export const collectionWithLoadMore = {
  query: SEARCH_QUERY,
  variables: {
    contactOpts: { limit: 10, offset: 25 },
    filter: { searchGroup: true },
    messageOpts: { limit: DEFAULT_MESSAGE_LIMIT },
  },
  data: {
    search: [...conversationData.slice(1, 5)],
  },
};

// add collection to apollo cache
cache.writeQuery(collection);

const client = new ApolloClient({
  cache: cache,
  uri: 'http://localhost:4000/',
  assumeImmutableResults: true,
});
window.HTMLElement.prototype.scrollIntoView = vi.fn();
const mocks = [loadMoreChats];

const chatMessages = (
  <MemoryRouter>
    <MockedProvider mocks={mocks}>
      <ApolloProvider client={client}>
        <ChatMessages entityId="2" />
      </ApolloProvider>
    </MockedProvider>
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

test('focus on the latest message', async () => {
  const { getByTestId } = render(chatMessages);
  await waitFor(() => {
    const message = getByTestId('message');
    expect(message.scrollIntoView).toBeCalled();
  });
});

test('click on Jump to latest', async () => {
  const { getByTestId } = render(chatMessages);
  const messageContainer: any = document.querySelector('.messageContainer');

  await act(async () => {
    await new Promise((r) => setTimeout(r, 1500));
  });

  fireEvent.scroll(messageContainer, { target: { scrollTop: 10 } });

  await waitFor(() => {
    fireEvent.click(getByTestId('jumpToLatest'));
  });
});

test('Contact: if not cache', async () => {
  const chatMessagesWithCollection = (
    <ApolloProvider client={client}>
      <Router>
        <MockedProvider mocks={[...CONVERSATION_MOCKS, ...mocksWithConversation]}>
          <ChatMessages entityId="5" />
        </MockedProvider>
      </Router>
    </ApolloProvider>
  );
  render(chatMessagesWithCollection);

  await waitFor(() => {});
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

// Need to scroll up first

test('Collection: click on Jump to latest', async () => {
  const { getByTestId } = render(chatMessagesWithCollection);
  const messageContainer: any = document.querySelector('.messageContainer');
  await act(async () => {
    await new Promise((r) => setTimeout(r, 1500));
  });

  fireEvent.scroll(messageContainer, { target: { scrollTop: 10 } });

  await waitFor(() => {
    fireEvent.click(getByTestId('jumpToLatest'));
  });
});

test('should send message to contact collections', async () => {
  const { getByTestId } = render(chatMessagesWithCollection);
  const editor = screen.getByTestId('editor');

  await userEvent.click(editor);
  await userEvent.tab();
  fireEvent.input(editor, { data: 'hey' });

  await waitFor(() => {
    expect(editor).toHaveTextContent('hey');
  });

  fireEvent.click(getByTestId('sendButton'), { force: true });

  await waitFor(() => {
    expect(screen.getByText('hey')).toBeInTheDocument();
  });
});

test('Collection: if not cache', async () => {
  const chatMessagesWithCollection = (
    <Router>
      <MockedProvider mocks={[...CONVERSATION_MOCKS, ...mocksWithConversation]}>
        <ChatMessages collectionId="5" />
      </MockedProvider>
    </Router>
  );
  const { getByTestId } = render(chatMessagesWithCollection);
  // need to check why we click this

  await waitFor(() => {});
});

test('Collection: if cache', async () => {
  cache.writeQuery(collection);

  const client = new ApolloClient({
    cache: cache,
    uri: 'http://localhost:4000/',
    assumeImmutableResults: true,
  });
  const chatMessagesWithCollection = (
    <ApolloProvider client={client}>
      <Router>
        <MockedProvider mocks={[...CONVERSATION_MOCKS, ...mocksWithConversation]}>
          <ChatMessages collectionId="5" />
        </MockedProvider>
      </Router>
    </ApolloProvider>
  );
  render(chatMessagesWithCollection);

  // need to check why we click this

  await waitFor(() => {});
});

test('click on Clear conversation', async () => {
  const chatMessages = (
    <MemoryRouter>
      <ApolloProvider client={client}>
        <ChatMessages entityId="2" />
      </ApolloProvider>
    </MemoryRouter>
  );
  const { getByTestId } = render(chatMessages);
  await waitFor(() => {
    fireEvent.click(getByTestId('dropdownIcon'));
    fireEvent.click(getByTestId('clearChatButton'));
    // need to check this
    // fireEvent.click(getByTestId('ok-button'));
    // expect(getByTestId('app')).toHaveTextContent('Conversation cleared for this contact');
  });
});

const messages = new Array(20).fill(body).map((b, index) => ({ ...b, id: `${index}` }));
test.only('Load more messages', async () => {
  const searchQuery = {
    query: SEARCH_QUERY,
    variables: {
      filter: {},
      contactOpts: { limit: DEFAULT_ENTITY_LIMIT },
      messageOpts: { limit: DEFAULT_MESSAGE_LIMIT },
    },
    data: {
      search: [
        {
          id: 'contact_2',
          group: null,
          contact: {
            id: '2',
            name: 'Effie Cormier',
            phone: '987654321',
            maskedPhone: '98****321',
            lastMessageAt: '2020-06-29T09:31:47Z',
            status: 'VALID',
            fields: '{}',
            bspStatus: 'SESSION_AND_HSM',
            isOrgRead: true,
          },
          messages,
        },
      ],
    },
  };

  cache.writeQuery(searchQuery);
  const client = new ApolloClient({
    cache: cache,
    uri: 'http://localhost:4000/',
    assumeImmutableResults: true,
  });

  const chatMessages = (
    <MemoryRouter>
      <MockedProvider mocks={[loadMoreChats]}>
        <ApolloProvider client={client}>
          <ChatMessages entityId="2" />
        </ApolloProvider>
      </MockedProvider>
    </MemoryRouter>
  );

  const { getByTestId } = render(chatMessages);

  await waitFor(() => {
    const container: any = document.querySelector('.messageContainer');
    fireEvent.scroll(container, { target: { scrollY: 0 } });
    fireEvent.click(getByTestId('loadMoreMessages'));
  });
});

test('Should render for multi-search', async () => {
  defineUrl('http://localhost:3000/chat/2?search=48');

  const { getByTestId } = render(chatMessages);

  await waitFor(() => {
    const container: any = document.querySelector('.messageContainer');
    fireEvent.scroll(container, { target: { scrollY: 0 } });
    fireEvent.click(getByTestId('loadMoreMessages'));
  });
});

test('send message to contact', async () => {
  const { getByTestId } = render(chatMessages);
  const editor = screen.getByTestId('editor');

  await userEvent.click(editor);
  await userEvent.tab();
  fireEvent.input(editor, { data: 'hey' });

  await waitFor(() => {
    expect(editor).toHaveTextContent('hey');
  });

  fireEvent.click(getByTestId('sendButton'), { force: true });

  await waitFor(() => {
    expect(screen.getByText('hey')).toBeInTheDocument();
  });
});

const groupscache = new InMemoryCache({ addTypename: false });
groupscache.writeQuery(waGroup);
groupscache.writeQuery(waGroupcollection);

const groupClient = new ApolloClient({
  cache: groupscache,
  uri: 'http://localhost:4000/',
  assumeImmutableResults: true,
});
let route = '/group/chat';

const chatMessagesWAGroups = (
  <MemoryRouter initialEntries={[route]}>
    <ApolloProvider client={groupClient}>
      <Routes>
        <Route path="group/chat" element={<ChatMessages entityId="2" />} />
      </Routes>
    </ApolloProvider>
  </MemoryRouter>
);

it('should have title as contact name for whatsapp groups', async () => {
  const { getByTestId } = render(chatMessagesWAGroups);
  await waitFor(() => {
    expect(getByTestId('beneficiaryName')).toHaveTextContent('Oklahoma sheep');
  });
});

test('send message to whatsapp group', async () => {
  const { getByTestId } = render(chatMessagesWAGroups);
  const editor = screen.getByTestId('editor');

  await userEvent.click(editor);
  await userEvent.tab();
  fireEvent.input(editor, { data: 'hey' });

  await waitFor(() => {
    expect(editor).toHaveTextContent('hey');
  });

  fireEvent.click(getByTestId('sendButton'), { force: true });

  await waitFor(() => {
    expect(screen.getByText('hey')).toBeInTheDocument();
  });
});

const collectionMessagesWAGroups = (
  <MemoryRouter initialEntries={[route]}>
    <ApolloProvider client={groupClient}>
      <Routes>
        <Route path="group/chat" element={<ChatMessages collectionId="1" />} />
      </Routes>
    </ApolloProvider>
  </MemoryRouter>
);

test('should send message to whatsapp group collections', async () => {
  const { getByTestId } = render(collectionMessagesWAGroups);
  const editor = screen.getByTestId('editor');

  await userEvent.click(editor);
  await userEvent.tab();
  fireEvent.input(editor, { data: 'hey' });

  await waitFor(() => {
    expect(editor).toHaveTextContent('hey');
  });

  fireEvent.click(getByTestId('sendButton'), { force: true });

  await waitFor(() => {
    expect(screen.getByText('hey')).toBeInTheDocument();
  });
});

test('should show error if send message fails', async () => {
  const { getByTestId } = render(
    <MemoryRouter>
      <MockedProvider mocks={[sendMessageMock]}>
        <ApolloProvider client={client}>
          <ChatMessages entityId="2" />
        </ApolloProvider>
      </MockedProvider>
    </MemoryRouter>
  );

  const editor = screen.getByTestId('editor');

  await userEvent.click(editor);
  await userEvent.tab();
  fireEvent.input(editor, { data: 'test' });

  await waitFor(() => {
    expect(editor).toHaveTextContent('test');
  });

  fireEvent.click(getByTestId('sendButton'), { force: true });
  await waitFor(() => {
    expect(setNotification).toHaveBeenCalled();
  });
});
