import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { AddMembersDialog } from './AddMembersDialog';
import { IMPORT_WA_GROUP_CONTACTS } from 'graphql/mutations/Group';
import { contactsListExcludeGroup } from 'mocks/Groups';
import { setNotification } from 'common/notification';

vi.mock('common/notification', async (importOriginal) => {
  const mod = await importOriginal<typeof import('common/notification')>();
  return {
    ...mod,
    setNotification: vi.fn(),
  };
});

const csv = 'phone\n919900112233\n';

const importMock = {
  request: {
    query: IMPORT_WA_GROUP_CONTACTS,
    variables: { waGroupId: '1', type: 'DATA', data: csv },
  },
  result: {
    data: {
      importWaGroupContacts: { status: 'WA group member import is in progress', errors: null },
    },
  },
};

const renderDialog = (mocks: any[] = [contactsListExcludeGroup], onClose = vi.fn()) =>
  render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <AddMembersDialog waGroupId="1" onClose={onClose} />
    </MockedProvider>
  );

beforeEach(() => vi.clearAllMocks());

test('renders the select-contacts mode by default', async () => {
  renderDialog();
  expect(await screen.findByText('Add members to this group')).toBeInTheDocument();
  // the contact search autocomplete is shown
  expect(await screen.findByTestId('autocomplete-element')).toBeInTheDocument();
});

test('uploads a CSV in CSV mode', async () => {
  const onClose = vi.fn();
  renderDialog([contactsListExcludeGroup, importMock], onClose);

  await screen.findByText('Add members to this group');
  fireEvent.click(screen.getByTestId('csvMode'));

  const input = screen.getByTestId('uploadWaMembers');
  const file = new File([csv], 'members.csv', { type: 'text/csv' });
  fireEvent.change(input, { target: { files: [file] } });

  // once the file is read, the Upload button is enabled
  await waitFor(() => {
    expect(screen.getByTestId('ok-button')).not.toBeDisabled();
  });

  fireEvent.click(screen.getByTestId('ok-button'));

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalledWith(
      'Member upload started. Check notifications for the report.',
      'success'
    );
  });
  expect(onClose).toHaveBeenCalled();
});

test('rejects a non-CSV file', async () => {
  renderDialog();

  await screen.findByText('Add members to this group');
  fireEvent.click(screen.getByTestId('csvMode'));

  const input = screen.getByTestId('uploadWaMembers');
  const file = new File(['nope'], 'members.txt', { type: 'text/plain' });
  fireEvent.change(input, { target: { files: [file] } });

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalledWith('Please upload a valid CSV file', 'warning');
  });
  // upload stays disabled with no valid file
  expect(screen.getByTestId('ok-button')).toBeDisabled();
});
