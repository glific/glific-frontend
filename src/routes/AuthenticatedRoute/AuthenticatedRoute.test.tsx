import { Suspense } from 'react';
import { render, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
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
window.HTMLElement.prototype.scrollIntoView = function () { };
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
});
