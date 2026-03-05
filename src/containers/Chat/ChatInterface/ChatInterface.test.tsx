import { MemoryRouter, Route, Routes } from 'react-router';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, vi, afterEach, test } from 'vitest';
import { MockLink } from '@apollo/client/testing';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';

import { DEFAULT_ENTITY_LIMIT, DEFAULT_MESSAGE_LIMIT, SEARCH_QUERY_VARIABLES } from 'common/constants';
import { SEARCH_QUERY } from 'graphql/queries/Search';
import { setUserSession } from 'services/AuthService';

import { getAttachmentPermissionMock } from 'mocks/Attachment';
import {
  collectionCountQuery,
  markAsReadMock,
  savedSearchQuery,
  savedSearchStatusQuery,
} from 'mocks/Chat';
import { contactCollectionsQuery } from 'mocks/Contact';
import { OrganizationStateMock } from 'mocks/Organization';
import { collectionCountSubscription, searchQuery, searchWithDateFilters } from 'mocks/Search';

import ChatInterface from './ChatInterface';
import { getWhatsAppManagedPhonesStatusMock } from 'mocks/StatusBar';
import { GET_WA_MANAGED_PHONES_STATUS } from 'graphql/queries/WaGroups';
import { GET_ORGANIZATION_STATUS } from 'graphql/queries/Organization';
import { getAllCollectionsQuery } from 'mocks/Collection';
import { getUsersQuery } from 'mocks/User';
import { getAllFlowLabelsQuery } from 'mocks/Flow';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

window.HTMLElement.prototype.scrollIntoView = vi.fn();

class IntersectionObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
window.IntersectionObserver = IntersectionObserverMock as any;

vi.mock('../../../components/UI/Form/WhatsAppEditor/WhatsAppEditor', () => ({
  default: ({ setEditorState, sendMessage }: any) => (
    <textarea
      data-testid="editor"
      onChange={(e) => setEditorState(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          sendMessage(e.currentTarget.value);
        }
      }}
    />
  ),
}));

const mockedUsedNavigate = vi.fn();
vi.mock('react-router', async () => ({
  ...(await vi.importActual('react-router')),
  useNavigate: () => mockedUsedNavigate,
}));

const getCache = () => {
  const cache = new InMemoryCache();
  cache.writeQuery({
    query: SEARCH_QUERY,
    variables: SEARCH_QUERY_VARIABLES,
    data: {
      __typename: 'Query',
      search: [
        {
          __typename: 'Conversation',
          id: 'contact_2',
          group: null,
          contact: {
            __typename: 'Contact',
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
          messages: [
            {
              __typename: 'ConversationMessage',
              id: '1',
              body: 'Hey there whats up?',
              insertedAt: '2020-06-25T13:36:43Z',
              location: null,
              messageNumber: 48,
              receiver: {
                __typename: 'LanguageUser',
                id: '1',
              },
              sender: {
                __typename: 'Contact',
                id: '2',
              },
              type: 'TEXT',
              media: null,
              errors: '{}',
              contextMessage: {
                __typename: 'ConversationMessage',
                body: 'All good',
                contextId: 1,
                messageNumber: 10,
                errors: '{}',
                media: null,
                type: 'TEXT',
                insertedAt: '2021-04-26T06:13:03.832721Z',
                location: null,
                receiver: {
                  __typename: 'LanguageUser',
                  id: '1',
                },
                sender: {
                  __typename: 'LanguageUser',
                  id: '2',
                  name: 'User',
                },
                interactiveContent: '{}',
                sendBy: 'test',
                flowLabel: null,
                whatsappFormResponse: null,
              },
              interactiveContent: '{}',
              sendBy: 'test',
              flowLabel: null,
              whatsappFormResponse: null,
            },
          ],
        },
      ],
    },
  });

  cache.writeQuery({
    query: GET_ORGANIZATION_STATUS,
    variables: {},
    data: OrganizationStateMock.result.data,
  });

  cache.writeQuery({
    query: GET_WA_MANAGED_PHONES_STATUS,
    data: getWhatsAppManagedPhonesStatusMock.result.data,
  });

  return cache;
};

const mocks = [
  collectionCountSubscription,
  collectionCountQuery,
  savedSearchStatusQuery,
  contactCollectionsQuery(2),
  OrganizationStateMock,
  getAttachmentPermissionMock,
  savedSearchQuery,
  markAsReadMock('2'),
  getWhatsAppManagedPhonesStatusMock,
  ...getAllCollectionsQuery,
  getUsersQuery,
  getAllFlowLabelsQuery,
  searchQuery,
  searchWithDateFilters(true),
  searchWithDateFilters(false, true),
  searchWithDateFilters(true, true),
];

const renderWithProviders = (ui: React.ReactElement, { initialEntries = ['/chat/2'], cache = getCache() } = {}) => {
  const link = new MockLink(mocks);
  const client = new ApolloClient({
    link,
    cache,
  });

  return render(
    <ApolloProvider client={client}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/chat/collection" element={<ChatInterface collectionType />} />
          <Route path="/chat/saved-searches" element={<ChatInterface savedSearches />} />
          <Route path="/chat/:contactId" element={ui} />
          <Route path="/chat" element={ui} />
        </Routes>
      </MemoryRouter>
    </ApolloProvider>
  );
};

setUserSession(JSON.stringify({ organization: { id: '1' } }));

afterEach(cleanup);

describe('Chat interface', () => {
  test('it should render chat interface component correctly', async () => {
    renderWithProviders(<ChatInterface />);
    expect(await screen.findByTestId('chatContainer')).toBeInTheDocument();
    expect(await screen.findByTestId('beneficiaryName')).toHaveTextContent('Effie Cormier');
  });

  test('should navigate to collections', async () => {
    renderWithProviders(<ChatInterface />);
    const collectionsTab = await screen.findByRole('tab', { name: /collections/i });
    fireEvent.click(collectionsTab);
    expect(mockedUsedNavigate).toHaveBeenCalledWith('/chat/collection');
  });

  test('should navigate to saved searches', async () => {
    renderWithProviders(<ChatInterface />);
    const searchesTab = await screen.findByRole('tab', { name: /searches/i });
    fireEvent.click(searchesTab);
    expect(mockedUsedNavigate).toHaveBeenCalledWith('/chat/saved-searches');
  });

  test('should have Collections as heading', async () => {
    renderWithProviders(<ChatInterface />);
    const collectionsTab = await screen.findByRole('tab', { name: /collections/i });
    fireEvent.click(collectionsTab);
    expect(await screen.findByText('Collections')).toBeInTheDocument();
  });

  test('should have Saved searches as heading', async () => {
    renderWithProviders(<ChatInterface />, { initialEntries: ['/chat/saved-searches'] });
    // In search mode, the heading becomes "Saved searches"
    expect(await screen.findByText('Saved searches')).toBeInTheDocument();
  });
});

describe('Chat interface for empty cache', () => {
  test('should render no conversations if there are no conversations', async () => {
    renderWithProviders(<ChatInterface />, { cache: new InMemoryCache() });
    expect(await screen.findByTestId('empty-result')).toBeInTheDocument();
  });
});

describe('Chat interface with filters', () => {
  test('should show filtered messages after applying `from` date filter', async () => {
    renderWithProviders(<ChatInterface />);

    expect(await screen.findByTestId('beneficiaryName')).toHaveTextContent('Effie Cormier');

    fireEvent.click(await screen.findByTestId('advanced-search-icon'));

    expect(await screen.findByText('Search conversations')).toBeInTheDocument();

    const dateFrom = screen.queryByPlaceholderText('Date from');

    if (dateFrom) {
      fireEvent.change(dateFrom, { target: { value: '04/30/2025' } });
    }

    fireEvent.click(screen.getByTestId('submitActionButton'));

    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalled();
    });
  });

  test('should show filtered messages after applying `to` date filter', async () => {
    renderWithProviders(<ChatInterface />);

    expect(await screen.findByTestId('beneficiaryName')).toHaveTextContent('Effie Cormier');

    fireEvent.click(await screen.findByTestId('advanced-search-icon'));

    expect(await screen.findByText('Search conversations')).toBeInTheDocument();

    const dateTo = screen.queryByPlaceholderText('Date to');

    if (dateTo) {
      fireEvent.change(dateTo, { target: { value: '05/05/2025' } });
    }

    fireEvent.click(screen.getByTestId('submitActionButton'));

    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalled();
    });
  });

  test('should show filtered messages after applying date range filter', async () => {
    renderWithProviders(<ChatInterface />);

    expect(await screen.findByTestId('beneficiaryName')).toHaveTextContent('Effie Cormier');

    fireEvent.click(await screen.findByTestId('advanced-search-icon'));

    expect(await screen.findByText('Search conversations')).toBeInTheDocument();

    const dateFrom = screen.queryByPlaceholderText('Date from');
    const dateTo = screen.queryByPlaceholderText('Date to');

    if (dateTo && dateFrom) {
      fireEvent.change(dateFrom, { target: { value: '2025-04-30' } });
      fireEvent.change(dateTo, { target: { value: '2025-05-05' } });
    }

    fireEvent.click(screen.getByTestId('submitActionButton'));

    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByTestId('show-current-messages'));

    fireEvent.click(screen.getByTestId('advanced-search-icon'));

    expect(await screen.findByText('Search conversations')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('additionalActionButton'));
  });
});

test('should open attachment dialog', async () => {
  renderWithProviders(<ChatInterface />);

  expect(await screen.findByTestId('beneficiaryName')).toHaveTextContent('Effie Cormier');

  const attachmentIcon = await screen.findByTestId('attachmentIcon');
  fireEvent.click(attachmentIcon);
  expect(await screen.findByText('Attach')).toBeInTheDocument();
});

test('should open emoji picker', async () => {
  renderWithProviders(<ChatInterface />);

  expect(await screen.findByTestId('beneficiaryName')).toHaveTextContent('Effie Cormier');

  fireEvent.click(await screen.findByTestId('emoji-picker'));
});

test('should have title as contact name for whatsapp groups', async () => {
  setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Admin'] }));
  renderWithProviders(<ChatInterface />);
  expect(await screen.findByTestId('beneficiaryName')).toHaveTextContent('Effie Cormier');
});

test('send message to whatsapp group', async () => {
  setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Admin'] }));
  renderWithProviders(<ChatInterface />);
  expect(await screen.findByTestId('beneficiaryName')).toHaveTextContent('Effie Cormier');
  const input = await screen.findByTestId('editor');
  fireEvent.change(input, { target: { value: 'hello' } });
  const sendButton = screen.getByTestId('sendButton');
  fireEvent.click(sendButton);
});

test('should send message to whatsapp group collections', async () => {
  setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Admin'] }));
  renderWithProviders(<ChatInterface />);
  expect(await screen.findByTestId('beneficiaryName')).toHaveTextContent('Effie Cormier');
  const input = await screen.findByTestId('editor');
  fireEvent.change(input, { target: { value: 'hello' } });
  const sendButton = screen.getByTestId('sendButton');
  fireEvent.click(sendButton);
});

test('should show error if send message fails', async () => {
  setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Admin'] }));
  renderWithProviders(<ChatInterface />);
  expect(await screen.findByTestId('beneficiaryName')).toHaveTextContent('Effie Cormier');
  const input = await screen.findByTestId('editor');
  fireEvent.change(input, { target: { value: 'error' } });
  const sendButton = screen.getByTestId('sendButton');
  fireEvent.click(sendButton);
});

test('Blocked contacts should redirect to chat page', async () => {
  renderWithProviders(<ChatInterface />);
  expect(await screen.findByTestId('beneficiaryName')).toHaveTextContent('Effie Cormier');
});
