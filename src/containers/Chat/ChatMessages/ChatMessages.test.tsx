import { InMemoryCache } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { DEFAULT_ENTITY_LIMIT, DEFAULT_MESSAGE_LIMIT } from 'common/constants';
import { SEARCH_QUERY } from 'graphql/queries/Search';
import ChatMessages from './ChatMessages';
import { MemoryRouter, Route, Routes } from 'react-router';
import { BrowserRouter as Router } from 'react-router-dom';
import { getAttachmentPermissionMock } from 'mocks/Attachment';
import { clearMessagesQuery, contactCollectionsQuery } from 'mocks/Contact';
import { OrganizationStateMock } from 'mocks/Organization';
import {
  CONVERSATION_MOCKS,
  conversationMock,
  createAndSendMessageMutation2,
  mocksWithConversation,
  sendMessageInWaGroup,
  sendMessageInWaGroupCollection,
  sendMessageMock,
} from 'mocks/Chat';
import { getCollectionInfo } from 'mocks/Collection';
import { userEvent } from '@testing-library/user-event';
import { setNotification } from 'common/notification';
import { waGroup, waGroupcollection } from 'mocks/Groups';
import { getContactSearchQuery } from 'mocks/Search';

vi.mock('common/notification', async (importOriginal) => {
  const mod = await importOriginal<typeof import('common/notification')>();
  return {
    ...mod,
    setNotification: vi.fn((...args) => {
      return args[1];
    }),
  };
});

const messages = (limit: number, skip: number) =>
  new Array(limit).fill(null).map((val: any, index: number) => ({
    id: `${index + skip}`,
    body: 'Hey there whats up?',
    insertedAt: `2020-${index}-25T13:36:43Z`,
    location: null,
    messageNumber: index + skip + 4,
    receiver: {
      id: '1',
    },
    sender: {
      id: '2',
    },
    type: 'TEXT',
    media: null,
    errors: '{}',
    contextMessage:
      index % 5 === 0
        ? {
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
          }
        : null,
    interactiveContent: '{}',
    sendBy: 'test',
    flowLabel: null,
  }));

const loadMoreQuery = (length: number, skip: number, filter: any) => ({
  request: {
    query: SEARCH_QUERY,
    variables: {
      contactOpts: { limit: 1 },
      filter: filter,
      messageOpts: { limit: 22, offset: 1 },
    },
  },
  result: {
    data: {
      search: [
        {
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
          group: null,
          id: 'contact_2',
          messages: messages(length, skip),
        },
      ],
    },
  },
});

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
          name: null,
          phone: '987654321',
          maskedPhone: '98****321',
          lastMessageAt: new Date(),
          status: 'VALID',
          fields:
            '{"name":{"value":"Effie Cormier","type":"string","label":"name","inserted_at":"2024-08-12T04:40:25.098162Z"}}',
          bspStatus: 'SESSION_AND_HSM',
          isOrgRead: true,
        },
        messages: messages(20, 1),
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
        messages: messages(10, 3),
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
        messages: messages(20, 1),
      },
      ...conversationData,
    ],
  },
};

const mocks = [
  ...CONVERSATION_MOCKS,
  ...mocksWithConversation,
  getAttachmentPermissionMock,
  contactCollectionsQuery(2),
  contactCollectionsQuery(3),
  OrganizationStateMock,
  conversationMock({
    contactOpts: { limit: 1 },
    filter: { id: '5' },
    messageOpts: { limit: 20, offset: 0 },
  }),
  clearMessagesQuery,
  loadMoreQuery(20, 20, { id: '2' }),
  getCollectionInfo({ id: '2' }),
  getCollectionInfo({ id: '5' }),
  conversationMock({
    contactOpts: { limit: 1 },
    messageOpts: { limit: 20, offset: 0 },
    filter: { id: '2' },
  }),
  conversationMock({
    contactOpts: { limit: 1 },
    messageOpts: { limit: 20, offset: 0 },
    filter: { id: '2', searchGroup: true },
  }),
  createAndSendMessageMutation2,
  sendMessageMock,
  sendMessageInWaGroup,
  sendMessageInWaGroupCollection,
  getContactSearchQuery,
  loadMoreQuery(0, 40, { id: '2' }),
  loadMoreQuery(0, 40, { id: '2', searchGroup: true }),
];

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

window.HTMLElement.prototype.scrollIntoView = vi.fn();

const chatMessages = (
  <MemoryRouter>
    <MockedProvider mocks={mocks} cache={cache}>
      <ChatMessages entityId="2" />
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
  const { getAllByText } = render(chatMessages);
  await waitFor(() => {
    expect(getAllByText('Hey there whats up?')[0]).toBeInTheDocument();
  });
});

test('it should open dropdown on clicking the message', () => {
  const { getAllByTestId } = render(chatMessages);

  const allMessageIcons = getAllByTestId('messageOptions');

  fireEvent.click(allMessageIcons[0]);

  expect(screen.getByTestId('popup')).toBeInTheDocument();
});

test('focus on the latest message', async () => {
  const { getAllByText } = render(chatMessages);
  await waitFor(() => {
    const messages = getAllByText('Hey there whats up?');

    // since there are 20 messages the latest is message[19]
    expect(messages[19].scrollIntoView).toHaveBeenCalled();
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

test('click on Clear conversation', async () => {
  const { getByTestId } = render(chatMessages);
  fireEvent.click(getByTestId('dropdownIcon'));
  fireEvent.click(getByTestId('clearChatButton'));

  fireEvent.click(getByTestId('ok-button'));

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalled();
  });
});

test('Contact: if not cache', async () => {
  const chatMessages = (
    <MemoryRouter>
      <MockedProvider mocks={mocks} cache={cache}>
        <ChatMessages entityId="3" />
      </MockedProvider>
    </MemoryRouter>
  );
  render(chatMessages);

  await waitFor(() => {
    expect(screen.getByTestId('beneficiaryName')).toHaveTextContent('New Contact');
  });
});

const chatMessagesWithCollection = (
  <MemoryRouter>
    <MockedProvider mocks={mocks} cache={cache}>
      <ChatMessages collectionId="2" />
    </MockedProvider>
  </MemoryRouter>
);

it('should have title as group name', async () => {
  const { getByTestId } = render(chatMessagesWithCollection);
  await waitFor(() => {
    expect(getByTestId('beneficiaryName')).toHaveTextContent('Default Group');
  });
});

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

test('it should click on context message ', () => {
  const { getAllByTestId } = render(chatMessages);
  fireEvent.click(getAllByTestId('reply-message')[0]);
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

test('Collection: if cache', async () => {
  cache.writeQuery(collection);

  const chatMessagesWithCollection = (
    <Router>
      <MockedProvider cache={cache} mocks={mocks}>
        <ChatMessages collectionId="2" />
      </MockedProvider>
    </Router>
  );
  render(chatMessagesWithCollection);

  await waitFor(() => {
    expect(screen.getByTestId('beneficiaryName')).toHaveTextContent('Default Group');
  });
});

test('Collection: if not cache', async () => {
  const chatMessagesWithCollection = (
    <Router>
      <MockedProvider cache={cache} mocks={mocks}>
        <ChatMessages collectionId="5" />
      </MockedProvider>
    </Router>
  );
  render(chatMessagesWithCollection);

  await waitFor(() => {
    expect(screen.getByTestId('beneficiaryName')).toHaveTextContent('Test 5');
  });
});

test('Should render for multi-search', async () => {
  const chatMessages = (
    <MemoryRouter initialEntries={['/chat/2?search=48']}>
      <MockedProvider mocks={mocks} cache={cache}>
        <ChatMessages entityId="2" />
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

test('Load more messages', async () => {
  const { getByTestId } = render(chatMessages);
  const container: any = document.querySelector('.messageContainer');
  const loadmore = getByTestId('loadMoreMessages');
  await waitFor(() => {
    fireEvent.scroll(container, { target: { scrollY: 0 } });
    fireEvent.click(loadmore);
  });

  await waitFor(() => {
    fireEvent.scroll(container, { target: { scrollY: 0 } });
    fireEvent.click(loadmore);
  });

  await waitFor(() => {
    expect(loadmore).not.toBeInTheDocument();
  });
});

test('Load more messages for collections', async () => {
  const { getByTestId } = render(chatMessagesWithCollection);
  const container: any = document.querySelector('.messageContainer');
  const loadmore = getByTestId('loadMoreMessages');

  await waitFor(() => {
    fireEvent.scroll(container, { target: { scrollY: 0 } });
    fireEvent.click(loadmore);
  });
});

const groupscache = new InMemoryCache({ addTypename: false });
groupscache.writeQuery(waGroup);
groupscache.writeQuery(waGroupcollection);

const route = '/group/chat';

const chatMessagesWAGroups = (
  <MockedProvider cache={groupscache} mocks={mocks}>
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="group/chat" element={<ChatMessages entityId="2" />} />
      </Routes>
    </MemoryRouter>
  </MockedProvider>
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
    <MockedProvider cache={groupscache} mocks={mocks}>
      <Routes>
        <Route path="group/chat" element={<ChatMessages collectionId="1" />} />
      </Routes>
    </MockedProvider>
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
    expect(setNotification).toHaveBeenCalled();
  });
});
