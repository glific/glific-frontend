import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import {
  collectionManagedPhonesMock as phonesMock,
  setPrimaryForCollectionMock as setPrimaryMock,
  COLLECTION_PRIMARY_STATUS as STATUS,
} from 'mocks/Groups';
import { setNotification } from 'common/notification';

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

test('hides the action for non-admin users', () => {
  mockRole.value = ['Staff'];
  renderComponent();
  expect(screen.queryByTestId('setCollectionPrimaryBtn')).not.toBeInTheDocument();
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

  fireEvent.click(screen.getByTestId('setCollectionPrimaryBtn'));

  await waitFor(() => {
    expect(screen.getByTestId('autocomplete-element')).toBeInTheDocument();
  });

  const autocomplete = screen.getByTestId('autocomplete-element');
  autocomplete.focus();
  fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });
  fireEvent.click(screen.getByText('Main — 918416933261'), { key: 'Enter' });

  fireEvent.click(screen.getByTestId('ok-button'));

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalledWith(STATUS, 'success');
  });

  await waitFor(() => {
    expect(screen.queryByTestId('setCollectionPrimaryDialog')).not.toBeInTheDocument();
  });
});
