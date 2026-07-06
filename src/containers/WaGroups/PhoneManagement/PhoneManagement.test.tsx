import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import {
  managedPhonesHealthMock,
  managedPhonesCountMock,
  phoneScreenMock,
  phoneScreenActiveMock,
  reconnectPhoneMock,
  syncPhoneStatusesMock,
  syncPhoneStatusesErrorsMock,
  syncPhoneStatusesNetworkErrorMock,
} from 'mocks/Groups';
import * as Notification from 'common/notification';
import { PhoneManagement } from './PhoneManagement';

const mockRole = vi.hoisted(() => ({ value: ['Admin'] }));
vi.mock('context/role', () => ({
  getUserRole: () => mockRole.value,
  getUserRolePermissions: () => ({ manageCollections: true, manageSavedSearches: true }),
}));

const baseMocks = [managedPhonesCountMock, managedPhonesHealthMock, managedPhonesCountMock, managedPhonesHealthMock];

const renderPage = (mocks: any[] = baseMocks) =>
  render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter>
        <PhoneManagement />
      </MemoryRouter>
    </MockedProvider>
  );

beforeEach(() => {
  mockRole.value = ['Admin'];
  vi.restoreAllMocks();
});

test('lists phones with their status', async () => {
  renderPage();

  await waitFor(() => {
    expect(screen.getByText('918416933261')).toBeInTheDocument();
  });

  expect(screen.getByText('918416933262')).toBeInTheDocument();
  expect(screen.getByText('active')).toBeInTheDocument();
  expect(screen.getByText('qr-screen')).toBeInTheDocument();
});

test('shows Reconnect only for a non-active phone (admin)', async () => {
  renderPage();

  await waitFor(() => {
    expect(screen.getByText('918416933261')).toBeInTheDocument();
  });

  // only the qr-screen phone gets a Reconnect action; the active one does not
  expect(screen.getAllByTestId('reconnectIcon')).toHaveLength(1);
});

test('hides Reconnect for non-admins', async () => {
  mockRole.value = ['Staff'];
  renderPage();

  await waitFor(() => {
    expect(screen.getByText('918416933261')).toBeInTheDocument();
  });

  expect(screen.queryByTestId('reconnectIcon')).not.toBeInTheDocument();
});

test('opens the reconnect dialog with the QR code', async () => {
  renderPage([...baseMocks, phoneScreenMock, reconnectPhoneMock]);

  await waitFor(() => {
    expect(screen.getByText('918416933262')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('reconnectIcon'));

  await waitFor(() => {
    expect(screen.getByTestId('reconnectDialog')).toBeInTheDocument();
  });

  await waitFor(() => {
    expect(screen.getByTestId('qrImage')).toHaveAttribute('src', 'data:image/png;base64,QQ==');
  });
});

test('syncs statuses from the header button', async () => {
  const notificationSpy = vi.spyOn(Notification, 'setNotification');
  renderPage([...baseMocks, syncPhoneStatusesMock, managedPhonesCountMock, managedPhonesHealthMock]);

  await waitFor(() => {
    expect(screen.getByText('918416933261')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('newItemButton'));

  await waitFor(() => {
    expect(notificationSpy).toHaveBeenCalledWith('WhatsApp phone statuses have been refreshed.', 'success');
  });
});

test('hides the Sync button for staff', async () => {
  mockRole.value = ['Staff'];
  renderPage();

  await waitFor(() => {
    expect(screen.getByText('918416933261')).toBeInTheDocument();
  });

  expect(screen.queryByTestId('newItemButton')).not.toBeInTheDocument();
});

test('warns when the status sync returns errors', async () => {
  const notificationSpy = vi.spyOn(Notification, 'setNotification');
  renderPage([...baseMocks, syncPhoneStatusesErrorsMock]);

  await waitFor(() => {
    expect(screen.getByText('918416933261')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('newItemButton'));

  await waitFor(() => {
    expect(notificationSpy).toHaveBeenCalledWith('Maytapi is not active', 'warning');
  });
});

test('surfaces an error when the status sync fails', async () => {
  const errorSpy = vi.spyOn(Notification, 'setErrorMessage');
  renderPage([...baseMocks, syncPhoneStatusesNetworkErrorMock]);

  await waitFor(() => {
    expect(screen.getByText('918416933261')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('newItemButton'));

  await waitFor(() => {
    expect(errorSpy).toHaveBeenCalled();
  });
});

test('closes the reconnect dialog on cancel', async () => {
  renderPage([...baseMocks, phoneScreenMock]);

  await waitFor(() => {
    expect(screen.getByText('918416933262')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('reconnectIcon'));

  await waitFor(() => {
    expect(screen.getByTestId('reconnectDialog')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('cancel-button'));

  expect(screen.queryByTestId('reconnectDialog')).not.toBeInTheDocument();
});

test('closes the reconnect dialog and refreshes once the phone reconnects', async () => {
  renderPage([
    ...baseMocks,
    phoneScreenMock,
    reconnectPhoneMock,
    phoneScreenActiveMock,
    // the refresh after reconnect re-runs the list + count queries
    managedPhonesCountMock,
    managedPhonesHealthMock,
  ]);

  await waitFor(() => {
    expect(screen.getByText('918416933262')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('reconnectIcon'));

  await waitFor(() => {
    expect(screen.getByTestId('reconnectDialog')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('ok-button'));

  // the screen flips to active -> dialog closes and the list refreshes
  await waitFor(() => {
    expect(screen.queryByTestId('reconnectDialog')).not.toBeInTheDocument();
  });
});
