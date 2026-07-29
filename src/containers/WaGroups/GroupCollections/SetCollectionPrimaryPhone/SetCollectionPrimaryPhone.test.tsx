import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import {
  collectionManagedPhonesMock as phonesMock,
  setPrimaryForCollectionMock as setPrimaryMock,
  setPrimaryForCollectionNoStatusMock as setPrimaryNoStatusMock,
  setPrimaryForCollectionErrorsMock as setPrimaryErrorsMock,
  setPrimaryForCollectionErrorMessage as PRIMARY_ERROR,
  setPrimaryForCollectionNetworkErrorMock as setPrimaryNetworkErrorMock,
  COLLECTION_PRIMARY_STATUS as STATUS,
} from 'mocks/Groups';
import { setNotification, setErrorMessage } from 'common/notification';

import { SetCollectionPrimaryPhone } from './SetCollectionPrimaryPhone';

vi.mock('common/notification', async (importOriginal) => {
  const mod = await importOriginal<typeof import('common/notification')>();
  return { ...mod, setNotification: vi.fn(), setErrorMessage: vi.fn() };
});

const mockRole = vi.hoisted(() => ({ value: ['Admin'] }));
vi.mock('context/role', () => ({ getUserRole: () => mockRole.value }));

const renderComponent = (mocks: any[] = [phonesMock]) =>
  render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <SetCollectionPrimaryPhone collectionId="5" />
    </MockedProvider>
  );

beforeEach(() => {
  mockRole.value = ['Admin'];
  vi.clearAllMocks();
});

// open the dialog, pick the one active phone, and click Apply
const selectPhoneAndApply = async () => {
  fireEvent.click(screen.getByTestId('setCollectionPrimaryBtn'));

  await waitFor(() => {
    expect(screen.getByTestId('autocomplete-element')).toBeInTheDocument();
  });

  const autocomplete = screen.getByTestId('autocomplete-element');
  autocomplete.focus();
  fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });
  fireEvent.click(screen.getByText('Main — 918416933261'), { key: 'Enter' });

  fireEvent.click(screen.getByTestId('ok-button'));
};

test('hides the action for non-admin users', () => {
  mockRole.value = ['Staff'];
  renderComponent();
  expect(screen.queryByTestId('setCollectionPrimaryBtn')).not.toBeInTheDocument();
});

test('shows the action for Glific_admin users', () => {
  mockRole.value = ['Glific_admin'];
  renderComponent();
  expect(screen.getByTestId('setCollectionPrimaryBtn')).toBeInTheDocument();
});

test('opens the phone-picker dialog for admins', async () => {
  renderComponent();
  fireEvent.click(screen.getByTestId('setCollectionPrimaryBtn'));

  await waitFor(() => {
    expect(screen.getByTestId('setCollectionPrimaryDialog')).toBeInTheDocument();
  });
});

test('applying a phone fires the bulk mutation and shows the background notification', async () => {
  renderComponent([phonesMock, setPrimaryMock]);

  await selectPhoneAndApply();

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalledWith(STATUS, 'success');
  });

  await waitFor(() => {
    expect(screen.queryByTestId('setCollectionPrimaryDialog')).not.toBeInTheDocument();
  });
});

test('falls back to the default background message when the mutation returns no status', async () => {
  renderComponent([phonesMock, setPrimaryNoStatusMock]);

  await selectPhoneAndApply();

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalledWith(STATUS, 'success');
  });
});

test('warns and keeps the dialog open when the mutation returns errors', async () => {
  renderComponent([phonesMock, setPrimaryErrorsMock]);

  await selectPhoneAndApply();

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalledWith(PRIMARY_ERROR, 'warning');
  });

  // a partial-failure response is not a success, so the dialog stays open
  expect(screen.getByTestId('setCollectionPrimaryDialog')).toBeInTheDocument();
});

test('surfaces an error message when the mutation fails', async () => {
  renderComponent([phonesMock, setPrimaryNetworkErrorMock]);

  await selectPhoneAndApply();

  await waitFor(() => {
    expect(setErrorMessage).toHaveBeenCalled();
  });
});
