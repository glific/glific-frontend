import { MemoryRouter } from 'react-router';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect } from 'vitest';
import { MockedProvider } from '@apollo/client/testing';
import { InMemoryCache } from '@apollo/client';

import { DEFAULT_ENTITY_LIMIT, DEFAULT_MESSAGE_LIMIT } from 'common/constants';
import { SEARCH_QUERY } from 'graphql/queries/Search';
import { setUserSession } from 'services/AuthService';

import { getAttachmentPermissionMock } from 'mocks/Attachment';
import {
  collectionCountQuery,
  conversationMock,
  markAsReadMock,
  savedSearchQuery,
  savedSearchStatusQuery,
} from 'mocks/Chat';
import { contactCollectionsQuery } from 'mocks/Contact';
import { OrganizationStateMock } from 'mocks/Organization';
import { collectionCountSubscription, searchQuery, searchWithDateFilters } from 'mocks/Search';

import ChatInterface from './ChatInterface';
import { getWhatsAppManagedPhonesStatusMock } from 'mocks/StatusBar';
import { getAllCollectionsQuery } from 'mocks/Collection';
import { getUsersQuery } from 'mocks/User';
import { getAllFlowLabelsQuery } from 'mocks/Flow';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { loadMoreQuery } from '../ChatMessages/ChatMessages.test';

dayjs.extend(utc);
dayjs.extend(timezone);

const mockedUsedNavigate = vi.fn();
vi.mock('react-router', async () => ({
  ...(await vi.importActual('react-router')),
  useNavigate: () => mockedUsedNavigate,
}));

const cache = new InMemoryCache({ addTypename: false });
cache.writeQuery({
  query: SEARCH_QUERY,
  variables: {
    contactOpts: { limit: DEFAULT_ENTITY_LIMIT },
    filter: {},
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
            whatsappFormResponse: null,
          },
        ],
      },
    ],
  },
});

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
];

const wrapper = (
  <MockedProvider cache={cache} mocks={mocks}>
    <MemoryRouter>
      <ChatInterface />
    </MemoryRouter>
  </MockedProvider>
);

setUserSession(JSON.stringify({ organization: { id: '1' } }));
window.HTMLElement.prototype.scrollIntoView = function () {};

describe('Chat interface', () => {
  test('it should render chat interface component correctly', async () => {
    render(wrapper);

    await waitFor(() => {
      expect(screen.getByTestId('beneficiaryName')).toHaveTextContent('Effie Cormier');
    });
  });

  test('should navigate to collections', async () => {
    const { getByText } = render(wrapper);

    await waitFor(() => {
      expect(screen.getByTestId('beneficiaryName')).toHaveTextContent('Effie Cormier');
    });

    fireEvent.click(getByText('Collections'));

    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalled();
    });
  });

  test('should navigate to saved searches', async () => {
    const { getByText } = render(wrapper);

    fireEvent.click(getByText('Searches'));

    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalled();
    });
  });
  test('should have Collections as heading', async () => {
    const { getByTestId } = render(
      <MockedProvider cache={cache} mocks={mocks}>
        <MemoryRouter>
          <ChatInterface collectionType={true} />
        </MemoryRouter>
      </MockedProvider>
    );

    await waitFor(() => {
      expect(getByTestId('heading')).toHaveTextContent('Collections');
    });
  });

  test('should have Saved searches as heading', async () => {
    const { getByTestId } = render(
      <MockedProvider cache={cache} mocks={mocks}>
        <MemoryRouter>
          <ChatInterface savedSearches={true} />
        </MemoryRouter>
      </MockedProvider>
    );
    await waitFor(() => {
      expect(getByTestId('heading')).toHaveTextContent('Saved searches');
    });
  });
});

const emptyCache = new InMemoryCache({ addTypename: false });

emptyCache.writeQuery({
  query: SEARCH_QUERY,
  variables: {
    contactOpts: { limit: DEFAULT_ENTITY_LIMIT },
    filter: {},
    messageOpts: { limit: DEFAULT_MESSAGE_LIMIT },
  },
  data: {
    search: [],
  },
});

beforeEach(() => {
  cleanup();
});

const emptyWrapper = (
  <MockedProvider cache={emptyCache} mocks={mocks}>
    <MemoryRouter>
      <ChatInterface />
    </MemoryRouter>
  </MockedProvider>
);

describe('Chat interface for empty cache', () => {
  test('should render no conversations if there are no conversations', async () => {
    const { getByTestId } = render(emptyWrapper);

    await waitFor(() => {
      expect(getByTestId('empty-result')).toBeInTheDocument();
    });
  });
});

describe('Chat interface with filters', () => {
  const cache = new InMemoryCache({ addTypename: false });
  cache.writeQuery(searchQuery);
  const MOCKS = [
    ...mocks,
    ...getAllCollectionsQuery,
    getUsersQuery,
    getAllFlowLabelsQuery,
    markAsReadMock('2'),
    searchWithDateFilters(true),
    searchWithDateFilters(false, true),
    searchWithDateFilters(true, true),
    conversationMock({ contactOpts: { limit: 25 }, messageOpts: { limit: 20 }, filter: {} }),
    loadMoreQuery(20, 20, { id: '2' }, { limit: 20, offset: 6 }),
    loadMoreQuery(20, 20, { id: '2' }, { limit: 20, offset: 44 }),
    loadMoreQuery(20, 20, { id: '2' }, { limit: 20, offset: 4 }),
  ];
  const wrapper = (
    <MockedProvider cache={cache} mocks={MOCKS}>
      <MemoryRouter>
        <ChatInterface />
      </MemoryRouter>
    </MockedProvider>
  );

  test('should show filtered messages after applying `from` date filter', async () => {
    render(wrapper);

    await waitFor(() => {
      expect(screen.getByTestId('beneficiaryName')).toHaveTextContent('Effie Cormier');
    });

    fireEvent.click(screen.getByTestId('advanced-search-icon'));

    await waitFor(() => {
      expect(screen.getByText('Search conversations')).toBeInTheDocument();
    });

    const dateFrom = screen.queryByTestId('Date from');
    const dateTo = screen.queryByTestId('Date to');

    if (dateFrom) {
      fireEvent.change(dateFrom, { target: { value: '05/01/2025' } });
    }

    fireEvent.click(screen.getByTestId('submitActionButton'));

    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalled();
    });
  });

  test('should show filtered messages after applying `to` date filter', async () => {
    render(wrapper);

    await waitFor(() => {
      expect(screen.getByTestId('beneficiaryName')).toHaveTextContent('Effie Cormier');
    });

    fireEvent.click(screen.getByTestId('advanced-search-icon'));

    await waitFor(() => {
      expect(screen.getByText('Search conversations')).toBeInTheDocument();
    });

    const dateTo = screen.queryByTestId('Date to');

    if (dateTo) {
      fireEvent.change(dateTo, { target: { value: '05/06/2025' } });
    }

    fireEvent.click(screen.getByTestId('submitActionButton'));

    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByTestId('loadMoreMessages'));
  });

  test('should show filtered messages after applying date range filter', async () => {
    render(wrapper);

    await waitFor(() => {
      expect(screen.getByTestId('beneficiaryName')).toHaveTextContent('Effie Cormier');
    });

    fireEvent.click(screen.getByTestId('advanced-search-icon'));

    await waitFor(() => {
      expect(screen.getByText('Search conversations')).toBeInTheDocument();
    });

    const dateFrom = screen.queryByTestId('Date from');
    const dateTo = screen.queryByTestId('Date to');

    if (dateTo && dateFrom) {
      fireEvent.change(dateFrom, { target: { value: '05/01/2025' } });
      fireEvent.change(dateTo, { target: { value: '05/06/2025' } });
    }

    fireEvent.click(screen.getByTestId('submitActionButton'));

    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByTestId('show-current-messages'));

    fireEvent.click(screen.getByTestId('advanced-search-icon'));

    await waitFor(() => {
      expect(screen.getByText('Search conversations')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('additionalActionButton'));

    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalled();
    });
  });
});
