/**
 * @vitest-environment jsdom
 */

import { InMemoryCache } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { DEFAULT_ENTITY_LIMIT, DEFAULT_MESSAGE_LIMIT } from 'common/constants';
import { SEARCH_QUERY } from 'graphql/queries/Search';
import ChatMessages from './ChatMessages';
import { MemoryRouter, Route, Routes, BrowserRouter as Router } from 'react-router';
import { createMediaMessageMock, getAttachmentPermissionMock } from 'mocks/Attachment';
import { clearMessagesQuery, contactCollectionsQuery } from 'mocks/Contact';
import { OrganizationStateMock } from 'mocks/Organization';
import {
  CONVERSATION_MOCKS,
  conversationMock,
  createAndSendMessageMutation,
  getContactStatusQuery,
  markAsReadMock,
  mocksWithConversation,
  sendMessageInWaGroup,
  sendMessageInWaGroupCollection,
  sendMessageMock,
} from 'mocks/Chat';
import { getCollectionInfo } from 'mocks/Collection';
import { userEvent } from '@testing-library/user-event';
import { waGroup, waGroupcollection } from 'mocks/Groups';
import { getBlockedContactSearchQuery, getContactSearchQuery, messages, searchQuery } from 'mocks/Search';
import { getWhatsAppManagedPhonesStatusMock } from 'mocks/StatusBar';
import { TEMPLATE_MOCKS } from 'mocks/Template';
import * as Notification from 'common/notification';

const mockIntersectionObserver = class {
  constructor() { }
  observe() { }
  unobserve() { }
  disconnect() { }
};

(window as any).IntersectionObserver = mockIntersectionObserver;
const notificationSpy = vi.spyOn(Notification, 'setNotification');

const mockedUsedNavigate = vi.fn();
vi.mock('react-router', async () => ({
  ...(await vi.importActual('react-router')),
  useNavigate: () => mockedUsedNavigate,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

export const loadMoreQuery = (
  length: number,
  skip: number,
  filter: any,
  messageOpts: any = { limit: 22, offset: 1 }
) => ({
  request: {
    query: SEARCH_QUERY,
    variables: {
      contactOpts: { limit: 1 },
      filter: filter,
      messageOpts,
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

const cache = new InMemoryCache();

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
  loadMoreQuery(20, 20, { id: '2' }, { limit: 3, offset: 1 }),
  getCollectionInfo({ id: '2' }),
  getCollectionInfo({ id: '5' }),
  getCollectionInfo({ id: '300' }),
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
  conversationMock(
    {
      contactOpts: { limit: 1 },
      messageOpts: { limit: 20, offset: 0 },
      filter: { id: '300', searchGroup: true },
    },
    [
      {
        contact: null,
        group: {
          id: '300',
          label: 'group 300',
        },
        id: 'group_300',
        messages: [],
      },
    ]
  ),
  createAndSendMessageMutation({
    body: 'hey',
    senderId: 1,
    receiverId: '2',
    flow: 'OUTBOUND',
    interactiveTemplateId: undefined,
    type: 'TEXT',
    mediaId: null,
  }),
  sendMessageMock,
  sendMessageInWaGroup,
  sendMessageInWaGroupCollection,
  getContactSearchQuery,
  loadMoreQuery(0, 40, { id: '2' }),
  loadMoreQuery(0, 40, { id: '2', searchGroup: true }),
  markAsReadMock('2'),
  markAsReadMock('3'),
  markAsReadMock('5'),
  getWhatsAppManagedPhonesStatusMock,
  ...TEMPLATE_MOCKS,
  createMediaMessageMock({
    caption: 'some description',
    sourceUrl: 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__340.jpg',
    url: 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__340.jpg',
  }),
  createAndSendMessageMutation({
    body: '',
    senderId: 1,
    receiverId: '2',
    flow: 'OUTBOUND',
    interactiveTemplateId: undefined,
    type: 'IMAGE',
    mediaId: '1',
    isHsm: true,
    templateId: 3,
    params: [],
  }),
];

export const chatMocks = mocks;

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
    expect(messages[19]).toBeInTheDocument();
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
    expect(notificationSpy).toHaveBeenCalled();
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

test('Collection: if not cache', async () => {
  const chatMessages = (
    <MemoryRouter>
      <MockedProvider mocks={mocks} cache={cache}>
        <ChatMessages collectionId="300" />
      </MockedProvider>
    </MemoryRouter>
  );
  render(chatMessages);

  await waitFor(() => {
    expect(screen.getByTestId('beneficiaryName')).toHaveTextContent('group 300');
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

test('should send media template message to contact', async () => {
  render(chatMessages);

  fireEvent.click(screen.getByTestId('shortcut-open-button'));
  fireEvent.click(screen.getByText('Templates'));

  await waitFor(() => {
    expect(screen.getByTestId('chatTemplates')).toBeInTheDocument();
  });

  fireEvent.click(screen.getAllByTestId('templateItem')[0]);

  fireEvent.click(screen.getByTestId('sendButton'));

  await waitFor(() => {
    expect(screen.getByText('Add attachments to message')).toBeInTheDocument();
  });
});

test('should send template message to contact', async () => {
  render(chatMessages);

  fireEvent.click(screen.getByTestId('shortcut-open-button'));
  fireEvent.click(screen.getByText('Templates'));

  await waitFor(() => {
    expect(screen.getByTestId('chatTemplates')).toBeInTheDocument();
  });

  fireEvent.click(screen.getAllByTestId('templateItem')[1]);

  fireEvent.click(screen.getByTestId('removeMessage'));

  fireEvent.click(screen.getByTestId('shortcut-open-button'));
  fireEvent.click(screen.getByText('Templates'));

  await waitFor(() => {
    expect(screen.getByTestId('chatTemplates')).toBeInTheDocument();
  });

  fireEvent.click(screen.getAllByTestId('templateItem')[1]);

  fireEvent.click(screen.getByTestId('sendButton'));
});

test('should open attachment dialog', async () => {
  render(chatMessages);

  fireEvent.click(screen.getByTestId('attachmentIcon'));

  await waitFor(() => {
    expect(screen.getByText('Add attachments to message')).toBeInTheDocument();
  });

  const autocomplete = screen.getByRole('combobox');
  autocomplete.focus();
  fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });

  fireEvent.click(screen.getByText('Image'), { key: 'Enter' });

  fireEvent.change(screen.getByPlaceholderText('Attachment URL'), {
    target: { value: 'https://www.buildquickbots.com/whatsapp/media/sample/jpg/sample01.jpg' },
  });

  fireEvent.click(screen.getByText('Add'));
});

test('should open emoji picker', async () => {
  render(chatMessages);

  fireEvent.click(screen.getByTestId('emoji-picker'));

  await waitFor(() => {
    expect(screen.getByTestId('emoji-container')).toBeInTheDocument();
  });
});

const groupscache = new InMemoryCache();
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
    expect(notificationSpy).toHaveBeenCalled();
  });
});

test('Blocked contacts should redirect to chat page', async () => {
  render(
    <MemoryRouter>
      <MockedProvider mocks={[...mocks, getBlockedContactSearchQuery, getContactStatusQuery]} cache={cache}>
        <ChatMessages entityId="5" />
      </MockedProvider>
    </MemoryRouter>
  );

  await waitFor(() => {
    expect(notificationSpy).toHaveBeenCalledWith('The contact is blocked', 'warning');
  });
});
