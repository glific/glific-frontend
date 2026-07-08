import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import {
  phoneScreenMock,
  phoneScreenActiveMock,
  phoneScreenNoCodeMock,
  reconnectPhoneMock,
  reconnectPhoneErrorsMock,
  reconnectPhoneNetworkErrorMock,
} from 'mocks/Groups';
import { setNotification, setErrorMessage } from 'common/notification';

import { ReconnectDialog } from './ReconnectDialog';

vi.mock('common/notification', async (importOriginal) => {
  const mod = await importOriginal<typeof import('common/notification')>();
  return { ...mod, setNotification: vi.fn(), setErrorMessage: vi.fn() };
});

const phone = { id: '2', phone: '918416933262', label: 'Backup' };

const renderDialog = (mocks: any[], props: any = {}) =>
  render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <ReconnectDialog phone={phone} onClose={vi.fn()} onReconnected={vi.fn()} {...props} />
    </MockedProvider>
  );

beforeEach(() => {
  vi.clearAllMocks();
});

test('renders the QR image from the screen query', async () => {
  renderDialog([phoneScreenMock]);

  await waitFor(() => {
    expect(screen.getByTestId('qrImage')).toHaveAttribute('src', 'data:image/png;base64,QQ==');
  });
});

test('shows a fallback when no QR is available yet', async () => {
  renderDialog([phoneScreenNoCodeMock]);

  await waitFor(() => {
    expect(screen.getByTestId('qrUnavailable')).toBeInTheDocument();
  });
});

test('"Log out & refresh QR" triggers the reconnect mutation', async () => {
  renderDialog([phoneScreenMock, reconnectPhoneMock, phoneScreenMock]);

  await waitFor(() => {
    expect(screen.getByTestId('qrImage')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('ok-button'));

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalledWith('Logged the phone out. Scan the new QR code to reconnect.', 'success');
  });
});

test('warns when the reconnect mutation returns errors', async () => {
  renderDialog([phoneScreenMock, reconnectPhoneErrorsMock]);

  await waitFor(() => {
    expect(screen.getByTestId('qrImage')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('ok-button'));

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalledWith('This WhatsApp phone is already connected.', 'warning');
  });
});

test('surfaces an error when the reconnect mutation fails', async () => {
  renderDialog([phoneScreenMock, reconnectPhoneNetworkErrorMock]);

  await waitFor(() => {
    expect(screen.getByTestId('qrImage')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('ok-button'));

  await waitFor(() => {
    expect(setErrorMessage).toHaveBeenCalled();
  });
});

test('does not report success when the phone is already active on open', async () => {
  const onReconnected = vi.fn();
  renderDialog([phoneScreenActiveMock], { onReconnected });

  await waitFor(() => {
    expect(screen.getByTestId('qrImage')).toBeInTheDocument();
  });

  // status was active from the start — never "reconnected"
  expect(onReconnected).not.toHaveBeenCalled();
  expect(setNotification).not.toHaveBeenCalledWith('WhatsApp phone reconnected.', 'success');
});

test('reports success once the phone flips from pending to active', async () => {
  const onReconnected = vi.fn();
  // open on qr-screen, log out, then the refetched screen reports active
  renderDialog([phoneScreenMock, reconnectPhoneMock, phoneScreenActiveMock], { onReconnected });

  await waitFor(() => {
    expect(screen.getByTestId('qrImage')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('ok-button'));

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalledWith('WhatsApp phone reconnected.', 'success');
  });
  expect(onReconnected).toHaveBeenCalled();
});
