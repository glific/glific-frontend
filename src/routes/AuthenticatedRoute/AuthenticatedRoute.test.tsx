import React, { Suspense } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router';
import { MockedProvider } from '@apollo/client/testing';
import { vi } from 'vitest';

import { getOrganizationBSP, OrganizationStateMock, walletBalanceQuery, walletBalanceSubscription } from 'mocks/Organization';
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

vi.mock('containers/Assistants/Assistants', () => ({
  default: () => <div data-testid="assistant-legacy" />,
}));

vi.mock('services/AuthService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('services/AuthService')>();
  return {
    ...actual,
    getOrganizationServices: vi.fn((service: string) => {
      if (service === 'assistantConfigVersionsEnabled') return true;
      return null;
    }),
  };
});

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
describe('<AuthenticatedRoute />', () => {
  test('it should render', async () => {
    setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Admin'] }));
    const { getByTestId } = render(
      <MockedProvider mocks={mocks}>
        <BrowserRouter>
          <Suspense fallback={<Loading />}>
            <AuthenticatedRoute />
          </Suspense>
        </BrowserRouter>
      </MockedProvider>
    );

    await waitFor(() => {
      expect(getByTestId('app')).toBeInTheDocument();
    });
  });

  test('renders new AssistantList when assistantConfigVersionsEnabled is true', async () => {
    const { getOrganizationServices } = await import('services/AuthService');
    (getOrganizationServices as ReturnType<typeof vi.fn>).mockImplementation((service: string) =>
      service === 'assistantConfigVersionsEnabled' ? true : null
    );

    setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Admin'] }));
    render(
      <MockedProvider mocks={mocks}>
        <MemoryRouter initialEntries={['/assistants']}>
          <Suspense fallback={<Loading />}>
            <AuthenticatedRoute />
          </Suspense>
        </MemoryRouter>
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('assistant-list-new')).toBeInTheDocument();
    });
  });

  test('renders legacy Assistant when assistantConfigVersionsEnabled is false', async () => {
    const { getOrganizationServices } = await import('services/AuthService');
    (getOrganizationServices as ReturnType<typeof vi.fn>).mockImplementation((service: string) =>
      service === 'assistantConfigVersionsEnabled' ? false : null
    );

    setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Admin'] }));
    render(
      <MockedProvider mocks={mocks}>
        <MemoryRouter initialEntries={['/assistants']}>
          <Suspense fallback={<Loading />}>
            <AuthenticatedRoute />
          </Suspense>
        </MemoryRouter>
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('assistant-legacy')).toBeInTheDocument();
    });
  });
});
