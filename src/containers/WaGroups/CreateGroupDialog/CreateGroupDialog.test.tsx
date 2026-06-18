import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { CreateGroupDialog } from './CreateGroupDialog';
import {
  contactsListForCreateGroup,
  createWaGroupQuery,
  createWaGroupWithErrors,
  createWaGroupNetworkError,
} from 'mocks/Groups';
import { setErrorMessage, setNotification } from 'common/notification';

vi.mock('common/notification', async (importOriginal) => {
  const mod = await importOriginal<typeof import('common/notification')>();
  return {
    ...mod,
    setNotification: vi.fn(),
    setErrorMessage: vi.fn(),
  };
});

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

test('creates the group on submit', async () => {
  const onCreated = vi.fn();
  const onClose = vi.fn();
  renderDialog([contactsListForCreateGroup, createWaGroupQuery], { onCreated, onClose });

  await screen.findByText('Create WhatsApp group');
  await fillAndSubmit();

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalledWith('WhatsApp group created', 'success');
  });
  expect(onCreated).toHaveBeenCalledWith({ id: '99', label: 'Test Group', bspId: '120363000000000000@g.us' });
  expect(onClose).toHaveBeenCalled();
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
