import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { SET_PRIMARY_PHONE } from 'graphql/mutations/Group';
import { GET_WA_GROUP } from 'graphql/queries/WaGroups';
import { setNotification } from 'common/notification';

import { PhonesPanel } from './PhonesPanel';

vi.mock('common/notification', async (importOriginal) => {
  const mod = await importOriginal<typeof import('common/notification')>();
  return {
    ...mod,
    setNotification: vi.fn(),
  };
});

const mockRole = vi.hoisted(() => ({ value: ['Admin'] }));

vi.mock('context/role', () => ({
  getUserRole: () => mockRole.value,
}));

const phones = [
  {
    id: '1001',
    isPrimary: true,
    isActive: true,
    waManagedPhone: { id: '1', phone: '918416933261', label: null, status: 'active' },
  },
  {
    id: '1002',
    isPrimary: false,
    isActive: true,
    waManagedPhone: { id: '2', phone: '918416933262', label: 'Backup', status: 'active' },
  },
  {
    id: '1003',
    isPrimary: false,
    isActive: false,
    waManagedPhone: { id: '3', phone: '918416933263', label: null, status: 'active' },
  },
];

const setPrimaryMock = (managedPhoneId: string, warning: string | null = null) => ({
  request: {
    query: SET_PRIMARY_PHONE,
    variables: { waGroupId: '1', waManagedPhoneId: managedPhoneId },
  },
  result: {
    data: {
      setPrimaryPhone: {
        waGroupPhone: {
          id: '999',
          isPrimary: true,
          isActive: true,
          waManagedPhone: { id: managedPhoneId, phone: '918416933262', label: 'Backup', status: 'active' },
        },
        warning,
        errors: null,
      },
    },
  },
});

const refetchMock = {
  request: { query: GET_WA_GROUP, variables: { waGroupId: '1' } },
  result: { data: { waGroup: { waGroup: { id: '1', phones } } } },
};

const renderPanel = (overrides?: { phones?: any; mocks?: any[] }) =>
  render(
    <MockedProvider mocks={overrides?.mocks ?? []} addTypename={false}>
      <PhonesPanel phones={overrides?.phones ?? phones} waGroupId="1" />
    </MockedProvider>
  );

beforeEach(() => {
  mockRole.value = ['Admin'];
  vi.clearAllMocks();
});

test('renders one row per ACTIVE phone with the primary badge', () => {
  renderPanel();

  // Active rows show. The inactive row (phone 3) is filtered out.
  expect(screen.getByTestId('phone-row-1')).toBeInTheDocument();
  expect(screen.getByTestId('phone-row-2')).toBeInTheDocument();
  expect(screen.queryByTestId('phone-row-3')).not.toBeInTheDocument();

  expect(screen.getByTestId('primary-badge')).toBeInTheDocument();
});

test('shows "Set as primary" on every non-primary active row for admins', () => {
  renderPanel();

  // Phone 1 is primary → no button. Phone 2 (active, non-primary) → button.
  expect(screen.queryByTestId('set-primary-1')).not.toBeInTheDocument();
  expect(screen.getByTestId('set-primary-2')).toBeInTheDocument();
});

test('hides "Set as primary" actions for non-admin users (read-only)', () => {
  mockRole.value = ['Staff'];
  renderPanel();

  expect(screen.queryByTestId('set-primary-2')).not.toBeInTheDocument();
});

test('clicking Set as primary opens a confirm dialog and firing the mutation shows a success toast', async () => {
  renderPanel({ mocks: [setPrimaryMock('2'), refetchMock] });

  fireEvent.click(screen.getByTestId('set-primary-2'));

  await waitFor(() => {
    expect(screen.getByTestId('confirm-set-primary')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('ok-button'));

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalledWith('Primary phone updated successfully.', 'success');
  });
});

test('mutation warning is surfaced as a warning notification', async () => {
  const warning = "Phone 918416933262 is currently 'loading' on Maytapi.";
  renderPanel({ mocks: [setPrimaryMock('2', warning), refetchMock] });

  fireEvent.click(screen.getByTestId('set-primary-2'));
  await waitFor(() => screen.getByTestId('confirm-set-primary'));
  fireEvent.click(screen.getByTestId('ok-button'));

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalledWith(warning, 'warning');
  });
});

test('preemptively warns inside the dialog when the target phone status is not active', async () => {
  const loadingPhones = [
    phones[0],
    {
      ...phones[1],
      waManagedPhone: { ...phones[1].waManagedPhone, status: 'loading' },
    },
  ];
  renderPanel({ phones: loadingPhones, mocks: [] });

  fireEvent.click(screen.getByTestId('set-primary-2'));

  await waitFor(() => {
    expect(screen.getByTestId('status-warning')).toBeInTheDocument();
  });
});

test('renders the empty state when no phones are linked', () => {
  renderPanel({ phones: [] });
  expect(screen.getByTestId('phones-empty')).toBeInTheDocument();
});
