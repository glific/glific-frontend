import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { CreateGroupDialog } from './CreateGroupDialog';
import {
  contactsListForCreateGroup,
  createWaGroupQuery,
  createWaGroupWithErrors,
  createWaGroupNetworkError,
  createWaGroupNoGroup,
  createWaGroupCsvQuery,
  newGroupConversation,
} from 'mocks/Groups';
import { setErrorMessage, setNotification } from 'common/notification';
import { saveGroupConversation } from 'services/GroupMessageService';

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

const phones = [{ id: '1', phone: '919999999999', label: 'Phone 1' }];

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

beforeEach(() => {
  vi.clearAllMocks();
});

test('renders nothing when closed', () => {
  const { container } = renderDialog([contactsListForCreateGroup], { open: false });
  expect(container).toBeEmptyDOMElement();
});

test('renders the create group dialog when open', async () => {
  renderDialog();
  expect(await screen.findByText('Create WhatsApp group')).toBeInTheDocument();
  expect(screen.getByText('Create')).toBeInTheDocument();
});

test('closes the dialog on cancel', async () => {
  const onClose = vi.fn();
  renderDialog([contactsListForCreateGroup], { onClose });

  await screen.findByText('Create WhatsApp group');
  fireEvent.click(screen.getByTestId('cancel-button'));

  expect(onClose).toHaveBeenCalled();
});

const fillAndSubmit = async () => {
  // type the group name
  fireEvent.change(screen.getByPlaceholderText('Group name'), { target: { value: 'Test Group' } });

  const [phoneEl, contactEl] = screen.getAllByTestId('autocomplete-element');

  // pick the creator phone (single select, options come from props)
  phoneEl.focus();
  fireEvent.keyDown(phoneEl, { key: 'ArrowDown' });
  fireEvent.click(await screen.findByText('Phone 1 — 919999999999'));

  // pick the first contact (multi select, options come from the contacts query)
  contactEl.focus();
  fireEvent.keyDown(contactEl, { key: 'ArrowDown' });
  fireEvent.click(await screen.findByText('Contact A'));

  fireEvent.click(screen.getByTestId('ok-button'));
};

test('creates the group on submit and adds it to the cache', async () => {
  const onCreated = vi.fn();
  const onClose = vi.fn();
  renderDialog([contactsListForCreateGroup, createWaGroupQuery, newGroupConversation], { onCreated, onClose });

  await screen.findByText('Create WhatsApp group');
  await fillAndSubmit();

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalledWith('WhatsApp group created', 'success');
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

test('updates the contact search term when typing', async () => {
  renderDialog();

  await screen.findByText('Create WhatsApp group');
  const [, contactInput] = screen.getAllByTestId('AutocompleteInput');
  const input = contactInput.querySelector('input') as HTMLInputElement;

  fireEvent.change(input, { target: { value: 'Con' } });

  // typing routes through onChange(string) -> setContactSearchTerm
  await waitFor(() => {
    expect(input.value).toBe('Con');
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

test('creates the group and imports members from a CSV', async () => {
  const onClose = vi.fn();
  renderDialog([contactsListForCreateGroup, createWaGroupCsvQuery, newGroupConversation], { onClose });

  await screen.findByText('Create WhatsApp group');

  // name + creator phone (the phone autocomplete is always the first one)
  fireEvent.change(screen.getByPlaceholderText('Group name'), { target: { value: 'Test Group' } });
  const [phoneEl] = screen.getAllByTestId('autocomplete-element');
  phoneEl.focus();
  fireEvent.keyDown(phoneEl, { key: 'ArrowDown' });
  fireEvent.click(await screen.findByText('Phone 1 — 919999999999'));

  // switch to CSV mode and upload a file
  fireEvent.click(screen.getByTestId('csvMode'));
  const input = screen.getByTestId('createGroupCsv');
  const file = new File(['phone\n919900112233\n'], 'members.csv', { type: 'text/csv' });
  fireEvent.change(input, { target: { files: [file] } });

  await waitFor(() => {
    expect(screen.getByTestId('ok-button')).not.toBeDisabled();
  });
  fireEvent.click(screen.getByTestId('ok-button'));

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalledWith(
      'WhatsApp group created. Members are being imported — check notifications for the report.',
      'success'
    );
  });
  expect(onClose).toHaveBeenCalled();
});
