import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import GroupDetails from './GroupDetails';
import {
  countWaGroupContacts,
  removeContactQuery,
  getWaGroupQuery,
  waGroupContacts,
  importMembersQuery,
  importMembersErrorResponse,
  importMembersNetworkError,
  renameGroupQuery,
  renameGroupErrorResponse,
  renameGroupNetworkError,
  removeContactErrorResponse,
  removeContactNetworkError,
} from 'mocks/Groups';
import { setNotification } from 'common/notification';

const mocks = [
  waGroupContacts,
  countWaGroupContacts,
  waGroupContacts,
  countWaGroupContacts,
  removeContactQuery,
  waGroupContacts,
  countWaGroupContacts,
  getWaGroupQuery,
];

vi.mock('common/notification', async (importOriginal) => {
  const mod = await importOriginal<typeof import('common/notification')>();
  return {
    ...mod,
    setNotification: vi.fn((...args) => {
      return args[1];
    }),
  };
});

vi.mock('react-router', async () => {
  return {
    ...(await vi.importActual<any>('react-router')),
    useParams: () => ({ id: '1' }),
  };
});

const wrapper = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter>
      <GroupDetails />
    </MemoryRouter>
  </MockedProvider>
);

test('should render Group details', async () => {
  const { getByTestId, getAllByTestId } = render(wrapper);

  expect(getByTestId('loader')).toBeInTheDocument();

  await waitFor(() => {
    expect(getAllByTestId('contact-name')[0]).toHaveTextContent('User 1');
    expect(getAllByTestId('phone-number')[0]).toHaveTextContent('918416933261');
  });
});

test('should render admin tag for admins', async () => {
  const { getByTestId, getByText } = render(wrapper);

  expect(getByTestId('loader')).toBeInTheDocument();

  await waitFor(() => {
    expect(getByText('Admin')).toBeInTheDocument();
  });
});

test('should render Maytapi Numer for maytapi managed numbers', async () => {
  const { getByTestId, getAllByTestId } = render(wrapper);

  expect(getByTestId('loader')).toBeInTheDocument();

  await waitFor(() => {
    expect(getAllByTestId('contact-name')[1]).toHaveTextContent('Maytapi Number');
  });
});

test('if number of groups exceed 4 it should show + n groups ', async () => {
  const { getByTestId, getAllByTestId } = render(wrapper);

  expect(getByTestId('loader')).toBeInTheDocument();

  await waitFor(() => {
    expect(getAllByTestId('contact-name')[0]).toHaveTextContent('User 1');

    // when number of groups is more than 4
    expect(getAllByTestId('contact-groups')[0]).toHaveTextContent('Group 1, Group 2, Group 3, Group 4 + 26 groups');

    // when number of groups is less than 4
    expect(getAllByTestId('contact-groups')[1]).toHaveTextContent('Maytapi Testing, Random2');
  });
});

test('should remove contact', async () => {
  const { getByTestId, getAllByTestId } = render(wrapper);

  expect(getByTestId('loader')).toBeInTheDocument();

  await waitFor(() => {
    expect(getAllByTestId('contact-name')[0]).toHaveTextContent('User 1');
  });

  fireEvent.click(getAllByTestId('removeContact')[0]);

  await waitFor(() => {
    expect(screen.getByTestId('dialogBox')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('ok-button'));

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalled();
  });
});

test('should close dialog box', async () => {
  const { getByTestId, getAllByTestId } = render(wrapper);

  expect(getByTestId('loader')).toBeInTheDocument();

  await waitFor(() => {
    expect(getAllByTestId('contact-name')[0]).toHaveTextContent('User 1');
  });

  fireEvent.click(getAllByTestId('removeContact')[0]);

  const dialogBox = screen.getByTestId('dialogBox');

  await waitFor(() => {
    expect(dialogBox).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('cancel-button'));

  await waitFor(() => {
    expect(dialogBox).not.toBeInTheDocument();
  });
});

const renderWith = (extraMocks: any[] = []) => (
  <MockedProvider mocks={[waGroupContacts, countWaGroupContacts, getWaGroupQuery, ...extraMocks]} addTypename={false}>
    <MemoryRouter>
      <GroupDetails />
    </MemoryRouter>
  </MockedProvider>
);

test('switches to the Phones and Details tabs', async () => {
  render(renderWith());

  await waitFor(() => {
    expect(screen.getByText('Phones')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText('Phones'));
  await waitFor(() => {
    expect(screen.getByTestId('phone-row-1')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText('Details'));
  await waitFor(() => {
    expect(screen.getByText('Collections')).toBeInTheDocument();
  });
  expect(screen.queryByTestId('phone-row-1')).not.toBeInTheDocument();
});

test('renames the group', async () => {
  render(renderWith([renameGroupQuery, getWaGroupQuery]));

  await waitFor(() => {
    expect(screen.getByTestId('renameGroup')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('renameGroup'));

  const nameInput = await screen.findByPlaceholderText('New name');
  fireEvent.change(nameInput, { target: { value: 'Renamed Group' } });

  fireEvent.click(screen.getByTestId('ok-button'));

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalled();
  });
});

const uploadCsv = () => {
  const input = screen.getByTestId('uploadWaMembers');
  const file = new File(['phone\n919900112233\n'], 'members.csv', { type: 'text/csv' });
  fireEvent.change(input, { target: { files: [file] } });
};

const openAddAndUpload = async () => {
  await waitFor(() => {
    expect(screen.getByTestId('addMembers')).toBeInTheDocument();
  });
  fireEvent.click(screen.getByTestId('addMembers'));

  await screen.findByTestId('uploadWaMembers');
  uploadCsv();

  await waitFor(() => {
    expect(screen.getByTestId('ok-button')).not.toBeDisabled();
  });
  fireEvent.click(screen.getByTestId('ok-button'));
};

test('adds members to the group via CSV upload', async () => {
  render(renderWith([importMembersQuery, getWaGroupQuery, waGroupContacts, countWaGroupContacts]));
  await openAddAndUpload();

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalledWith(
      "Member upload started in the background — you'll be notified when it's done.",
      'success'
    );
  });
});

const openRemoveAndConfirm = async () => {
  await waitFor(() => {
    expect(screen.getAllByTestId('contact-name')[0]).toHaveTextContent('User 1');
  });
  fireEvent.click(screen.getAllByTestId('removeContact')[0]);
  await screen.findByTestId('dialogBox');
  fireEvent.click(screen.getByTestId('ok-button'));
};

test('warns when removing a contact returns errors', async () => {
  render(renderWith([removeContactErrorResponse, getWaGroupQuery, waGroupContacts, countWaGroupContacts]));
  await openRemoveAndConfirm();

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalledWith('Remove failed', 'warning');
  });
});

test('warns when removing a contact errors out', async () => {
  render(renderWith([removeContactNetworkError]));
  await openRemoveAndConfirm();

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalledWith('Could not remove contact from the group', 'warning');
  });
});

test('warns when the member import returns errors', async () => {
  render(renderWith([importMembersErrorResponse]));
  await openAddAndUpload();

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalledWith('Could not add member', 'warning');
  });
});

test('warns when the member import errors out', async () => {
  render(renderWith([importMembersNetworkError]));
  await openAddAndUpload();

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalledWith('Could not upload members', 'warning');
  });
});

test('disables Upload until a CSV is added', async () => {
  render(renderWith());

  await waitFor(() => {
    expect(screen.getByTestId('addMembers')).toBeInTheDocument();
  });
  fireEvent.click(screen.getByTestId('addMembers'));
  await screen.findByTestId('uploadWaMembers');

  // nothing uploaded yet -> the Upload button is disabled
  expect(screen.getByTestId('ok-button')).toBeDisabled();
});

const openRenameAndSubmit = async () => {
  await waitFor(() => {
    expect(screen.getByTestId('renameGroup')).toBeInTheDocument();
  });
  fireEvent.click(screen.getByTestId('renameGroup'));
  const nameInput = await screen.findByPlaceholderText('New name');
  fireEvent.change(nameInput, { target: { value: 'Renamed Group' } });
  fireEvent.click(screen.getByTestId('ok-button'));
};

test('warns when renaming returns errors', async () => {
  render(renderWith([renameGroupErrorResponse, getWaGroupQuery]));
  await openRenameAndSubmit();

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalledWith('Rename failed', 'warning');
  });
});

test('warns when renaming errors out', async () => {
  render(renderWith([renameGroupNetworkError]));
  await openRenameAndSubmit();

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalledWith('Could not rename group', 'warning');
  });
});

test('cancels the add-members dialog', async () => {
  render(renderWith());

  await waitFor(() => {
    expect(screen.getByTestId('addMembers')).toBeInTheDocument();
  });
  fireEvent.click(screen.getByTestId('addMembers'));
  await screen.findByTestId('uploadWaMembers');

  fireEvent.click(screen.getByTestId('cancel-button'));

  await waitFor(() => {
    expect(screen.queryByText('Add members to this group')).not.toBeInTheDocument();
  });
});

test('cancels the rename dialog', async () => {
  render(renderWith());

  await waitFor(() => {
    expect(screen.getByTestId('renameGroup')).toBeInTheDocument();
  });
  fireEvent.click(screen.getByTestId('renameGroup'));
  await screen.findByPlaceholderText('New name');

  fireEvent.click(screen.getByTestId('cancel-button'));

  await waitFor(() => {
    expect(screen.queryByPlaceholderText('New name')).not.toBeInTheDocument();
  });
});
