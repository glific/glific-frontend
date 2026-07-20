import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { AddMembersDialog } from './AddMembersDialog';
import { IMPORT_WA_GROUP_CONTACTS } from 'graphql/mutations/Group';
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

const renderDialog = (mocks: any[] = [], onClose = vi.fn()) =>
  render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <AddMembersDialog waGroupId="1" onClose={onClose} />
    </MockedProvider>
  );

beforeEach(() => vi.clearAllMocks());

test('renders the CSV upload', async () => {
  renderDialog();
  expect(await screen.findByText('Add members to this group')).toBeInTheDocument();
  expect(screen.getByTestId('uploadWaMembers')).toBeInTheDocument();
  // no CSV yet → Upload disabled
  expect(screen.getByTestId('ok-button')).toBeDisabled();
});

test('uploads a CSV and reports the import started in the background', async () => {
  const onClose = vi.fn();
  renderDialog([importMock], onClose);

  await screen.findByText('Add members to this group');

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
      "Member upload started in the background — you'll be notified when it's done.",
      'success'
    );
  });
  expect(onClose).toHaveBeenCalled();
});

test('rejects a non-CSV file', async () => {
  renderDialog();

  await screen.findByText('Add members to this group');

  const input = screen.getByTestId('uploadWaMembers');
  const file = new File(['nope'], 'members.txt', { type: 'text/plain' });
  fireEvent.change(input, { target: { files: [file] } });

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalledWith('Please upload a valid CSV file', 'warning');
  });
  // upload stays disabled with no valid file
  expect(screen.getByTestId('ok-button')).toBeDisabled();
});
