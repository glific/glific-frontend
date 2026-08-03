import React, { Suspense } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router';
import { MockedProvider } from '@apollo/client/testing';
import { vi } from 'vitest';

import {
  getOrganizationBSP,
  OrganizationStateMock,
  walletBalanceQuery,
  walletBalanceSubscription,
} from 'mocks/Organization';
import { setUserSession } from 'services/AuthService';
import { collectionCountQuery, CONVERSATION_MOCKS, markAsReadMock, savedSearchStatusQuery } from 'mocks/Chat';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import AuthenticatedRoute from './AuthenticatedRoute';
import { getNotificationCountQuery } from 'mocks/Notifications';
import { collectionCountSubscription } from 'mocks/Search';
import { getWhatsAppManagedPhonesStatusMock } from 'mocks/StatusBar';
import { getAttachmentPermissionMock } from 'mocks/Attachment';

vi.mock('axios');

vi.mock('components/UI/Layout/Layout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('containers/Assistants/AssistantList/AssistantList', () => ({
  default: () => <div data-testid="assistant-list-new" />,
}));

vi.mock('containers/Assistants/AssistantDetail/AssistantDetail', () => ({
  default: () => <div data-testid="assistant-detail-new" />,
}));

vi.mock('containers/Analytics/Analytics', () => ({
  default: () => <div data-testid="analytics-page" />,
}));

const mocks = [
  ...walletBalanceQuery,
  ...walletBalanceSubscription,
  ...CONVERSATION_MOCKS,
  getOrganizationBSP,
  getNotificationCountQuery,
  markAsReadMock('2'),
  collectionCountSubscription,
  collectionCountQuery,
  savedSearchStatusQuery,
  OrganizationStateMock,
  getWhatsAppManagedPhonesStatusMock,
  getAttachmentPermissionMock,
];
window.HTMLElement.prototype.scrollIntoView = function () {};

interface RenderAuthenticatedRouteOptions {
  mocks?: React.ComponentProps<typeof MockedProvider>['mocks'];
  initialEntries?: React.ComponentProps<typeof MemoryRouter>['initialEntries'];
}

const renderAuthenticatedRoute = ({
  mocks: mocksOverride = mocks,
  initialEntries,
}: RenderAuthenticatedRouteOptions = {}) => {
  const routeTree = (
    <Suspense fallback={<Loading />}>
      <AuthenticatedRoute />
    </Suspense>
  );

  return render(
    <MockedProvider mocks={mocksOverride}>
      {initialEntries ? (
        <MemoryRouter initialEntries={initialEntries}>{routeTree}</MemoryRouter>
      ) : (
        <BrowserRouter>{routeTree}</BrowserRouter>
      )}
    </MockedProvider>
  );
};

describe('<AuthenticatedRoute />', () => {
  test('it should render', async () => {
    setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Admin'] }));
    const { getByTestId } = renderAuthenticatedRoute();

    await waitFor(() => {
      expect(getByTestId('app')).toBeInTheDocument();
    });
  });

  test('renders AssistantList at /assistants', async () => {
    setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Admin'] }));
    renderAuthenticatedRoute({ initialEntries: ['/assistants'] });

    await waitFor(() => {
      expect(screen.getByTestId('assistant-list-new')).toBeInTheDocument();
    });
  });

  test.each(['Staff', 'Manager', 'Admin', 'Glific_admin'])(
    'renders Analytics at /analytics for %s role',
    async (role) => {
      setUserSession(JSON.stringify({ organization: { id: '1' }, roles: [role] }));
      renderAuthenticatedRoute({ initialEntries: ['/analytics'] });

      await waitFor(() => {
        expect(screen.getByTestId('analytics-page')).toBeInTheDocument();
      });
    }
  );
});
