import { MemoryRouter } from 'react-router';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect } from 'vitest';
import { MockedProvider } from '@apollo/client/testing';
import { InMemoryCache } from '@apollo/client';

import { DEFAULT_ENTITY_LIMIT, DEFAULT_MESSAGE_LIMIT } from 'common/constants';
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
import { collectionCountSubscription } from 'mocks/Search';

import ChatInterface from './ChatInterface';

const mockedUsedNavigate = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
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
