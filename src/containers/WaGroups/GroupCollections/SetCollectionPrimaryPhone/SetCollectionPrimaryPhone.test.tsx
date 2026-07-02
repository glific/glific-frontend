import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { GET_WA_MANAGED_PHONES } from 'graphql/queries/WaGroups';
import { SET_PRIMARY_PHONE_FOR_COLLECTION } from 'graphql/mutations/Group';
import { setNotification } from 'common/notification';

import { SetCollectionPrimaryPhone } from './SetCollectionPrimaryPhone';

vi.mock('common/notification', async (importOriginal) => {
  const mod = await importOriginal<typeof import('common/notification')>();
  return { ...mod, setNotification: vi.fn(), setErrorMessage: vi.fn() };
});

const mockRole = vi.hoisted(() => ({ value: ['Admin'] }));
vi.mock('context/role', () => ({ getUserRole: () => mockRole.value }));

const phonesMock = {
  request: { query: GET_WA_MANAGED_PHONES, variables: { filter: {} } },
  result: {
    data: {
      waManagedPhones: [
        { id: '1', phone: '918416933261', label: 'Main', status: 'active' },
        // inactive phone is filtered out of the options
        { id: '2', phone: '918416933262', label: null, status: 'loading' },
      ],
    },
  },
};

const STATUS = 'Setting the primary phone across the collection has started in the background.';

const setPrimaryMock = {
  request: {
    query: SET_PRIMARY_PHONE_FOR_COLLECTION,
    variables: { collectionId: '5', waManagedPhoneId: '1' },
  },
  result: {
    data: {
      setPrimaryPhoneForCollection: { status: STATUS, userJobId: '77', errors: null },
    },
  },
};

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
});
