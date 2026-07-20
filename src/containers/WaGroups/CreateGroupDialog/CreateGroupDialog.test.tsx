import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { CreateGroupDialog } from './CreateGroupDialog';
import {
  contactsListForCreateGroup,
  createWaGroupQuery,
  createWaGroupWithErrors,
  createWaGroupNetworkError,
  createWaGroupNoGroup,
  newGroupConversation,
} from 'mocks/Groups';
import { setErrorMessage, setNotification } from 'common/notification';
import { saveGroupConversation } from 'services/GroupMessageService';
import { toActivePhoneOptions } from 'containers/WaGroups/managedPhones';

vi.mock('common/notification', async (importOriginal) => {
  const mod = await importOriginal<typeof import('common/notification')>();
  return {
    ...mod,
    setNotification: vi.fn(),
    setErrorMessage: vi.fn(),
  };
});

vi.mock('services/GroupMessageService', () => ({
  saveGroupConversation: vi.fn(),
}));

const phones = [
  { id: '1', phone: '919999999999', label: 'Phone 1', status: 'active' },
  { id: '2', phone: '918888888888', label: 'Phone 2', status: 'idle' },
];

const defaultProps = {
  open: true,
  phones,
  defaultPhone: phones[0],
  onClose: vi.fn(),
  onCreated: vi.fn(),
};

const renderDialog = (mocks: any[] = [contactsListForCreateGroup], props = {}) =>
  render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <CreateGroupDialog {...defaultProps} {...props} />
    </MockedProvider>
  );

const CREATION_STARTED =
  "Group creation started. Members are being imported in the background — you'll be notified when it's done.";

beforeEach(() => {
  vi.clearAllMocks();
});

// Members are CSV-only: type the name (creator phone is pre-filled from
// defaultPhone) and upload a CSV whose content matches the mocked importData.
const fillAndSubmit = async () => {
  fireEvent.change(screen.getByPlaceholderText('Group name'), { target: { value: 'Test Group' } });

  const input = screen.getByTestId('createGroupCsv');
  const file = new File(['phone\n919900112233\n'], 'members.csv', { type: 'text/csv' });
  fireEvent.change(input, { target: { files: [file] } });

  await waitFor(() => {
    expect(screen.getByTestId('ok-button')).not.toBeDisabled();
  });
  fireEvent.click(screen.getByTestId('ok-button'));
};

test('renders nothing when closed', () => {
  const { container } = renderDialog([contactsListForCreateGroup], { open: false });
  expect(container).toBeEmptyDOMElement();
});

test('renders the create group dialog when open', async () => {
  renderDialog();
  expect(await screen.findByText('Create WhatsApp group')).toBeInTheDocument();
  expect(screen.getByText('Create')).toBeInTheDocument();
});

test('only lists active phones as the creator', async () => {
  renderDialog();
  await screen.findByText('Create WhatsApp group');

  const [phoneEl] = screen.getAllByTestId('autocomplete-element');
  phoneEl.focus();
  fireEvent.keyDown(phoneEl, { key: 'ArrowDown' });

  // active phone is offered; the idle one is filtered out
  expect(await screen.findByText('Phone 1 — 919999999999')).toBeInTheDocument();
  expect(screen.queryByText('Phone 2 — 918888888888')).not.toBeInTheDocument();
});

test('requires a CSV before the group can be created', async () => {
  renderDialog();
  await screen.findByText('Create WhatsApp group');

  fireEvent.change(screen.getByPlaceholderText('Group name'), { target: { value: 'Test Group' } });
  // no CSV uploaded yet → Create stays disabled
  expect(screen.getByTestId('ok-button')).toBeDisabled();
});

test('closes the dialog on cancel', async () => {
  const onClose = vi.fn();
  renderDialog([contactsListForCreateGroup], { onClose });

  await screen.findByText('Create WhatsApp group');
  fireEvent.click(screen.getByTestId('cancel-button'));

  expect(onClose).toHaveBeenCalled();
});

test('creates the group from a CSV and adds it to the cache', async () => {
  const onCreated = vi.fn();
  const onClose = vi.fn();
  renderDialog([contactsListForCreateGroup, createWaGroupQuery, newGroupConversation], { onCreated, onClose });

  await screen.findByText('Create WhatsApp group');
  await fillAndSubmit();

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalledWith(CREATION_STARTED, 'success');
  });
  expect(onCreated).toHaveBeenCalledWith({ id: '99', label: 'Test Group', bspId: '120363000000000000@g.us' });
  expect(onClose).toHaveBeenCalled();

  // the new group's conversation is written into the cached list
  await waitFor(() => {
    expect(saveGroupConversation).toHaveBeenCalled();
  });
});

test('warns when the server returns no group', async () => {
  renderDialog([contactsListForCreateGroup, createWaGroupNoGroup]);

  await screen.findByText('Create WhatsApp group');
  await fillAndSubmit();

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalledWith('Could not create WhatsApp group', 'warning');
  });
});

test('surfaces server errors on submit', async () => {
  renderDialog([contactsListForCreateGroup, createWaGroupWithErrors]);

  await screen.findByText('Create WhatsApp group');
  await fillAndSubmit();

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalledWith('Group already exists', 'warning');
  });
});

test('surfaces network errors on submit', async () => {
  renderDialog([contactsListForCreateGroup, createWaGroupNetworkError]);

  await screen.findByText('Create WhatsApp group');
  await fillAndSubmit();

  await waitFor(() => {
    expect(setErrorMessage).toHaveBeenCalled();
  });
});

// the shared helper backing both CreateGroupDialog and SetCollectionPrimaryPhone
describe('toActivePhoneOptions', () => {
  test('returns an empty list for undefined, null or empty input', () => {
    expect(toActivePhoneOptions()).toEqual([]);
    expect(toActivePhoneOptions(null as any)).toEqual([]);
    expect(toActivePhoneOptions([])).toEqual([]);
  });

  test('keeps only active phones and formats the label as "Label — number"', () => {
    const options = toActivePhoneOptions([
      { id: '1', phone: '911111111111', label: 'Main', status: 'active' },
      // active but unlabeled -> falls back to the bare number
      { id: '2', phone: '922222222222', label: null, status: 'active' },
      // non-active phones are dropped
      { id: '3', phone: '933333333333', label: 'Loading', status: 'loading' },
      { id: '4', phone: '944444444444', label: 'No status' },
    ]);

    expect(options).toEqual([
      { id: '1', label: 'Main — 911111111111' },
      { id: '2', label: '922222222222' },
    ]);
  });
});
