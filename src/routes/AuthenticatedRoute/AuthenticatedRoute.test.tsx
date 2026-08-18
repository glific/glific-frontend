import { MockedProvider } from '@apollo/client/testing/react';
import { render, screen, waitFor } from '@testing-library/react';
import React, { Suspense } from 'react';
import { BrowserRouter, MemoryRouter } from 'react-router';
import { vi } from 'vitest';

import { Loading } from 'components/UI/Layout/Loading/Loading';
import { getAttachmentPermissionMock } from 'mocks/Attachment';
import { collectionCountQuery, CONVERSATION_MOCKS, markAsReadMock, savedSearchStatusQuery } from 'mocks/Chat';
import { getNotificationCountQuery } from 'mocks/Notifications';
import {
  getOrganizationBSP,
  OrganizationStateMock,
  walletBalanceQuery,
  walletBalanceSubscription,
} from 'mocks/Organization';
import { collectionCountSubscription } from 'mocks/Search';
import { getWhatsAppManagedPhonesStatusMock } from 'mocks/StatusBar';
import { setOrganizationServices, setUserSession } from 'services/AuthService';
import AuthenticatedRoute from './AuthenticatedRoute';

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

vi.mock('containers/HSM/HSMList/HSMList', () => ({
  default: () => <div data-testid="hsm-list-old" />,
}));

vi.mock('containers/HSM/HSMListV2/HSMListV2', () => ({
  default: () => <div data-testid="hsm-list-new" />,
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

  test('renders the legacy HSMList at /template when templateV2Enabled is off', async () => {
    setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Admin'] }));
    setOrganizationServices(JSON.stringify({ templateV2Enabled: false }));
    renderAuthenticatedRoute({ initialEntries: ['/template'] });

    await waitFor(() => {
      expect(screen.getByTestId('hsm-list-old')).toBeInTheDocument();
    });
  });

  test('renders HSMListV2 at /template when templateV2Enabled is on', async () => {
    setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Admin'] }));
    setOrganizationServices(JSON.stringify({ templateV2Enabled: true }));
    renderAuthenticatedRoute({ initialEntries: ['/template'] });

    await waitFor(() => {
      expect(screen.getByTestId('hsm-list-new')).toBeInTheDocument();
    });
  });
});
