import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import GroupDetails from './GroupDetails';
import {
  countWaGroupContacts,
  removeContactQuery,
  getWaGroupQuery,
  waGroupContacts,
  contactsListExcludeGroup,
  addMembersQuery,
  addMembersErrorResponse,
  addMembersNetworkError,
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
    expect(screen.getByText('Details')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText('Details'));
  // ContactDescription renders the details panel
  await waitFor(() => {
    expect(screen.getByText('Details')).toBeInTheDocument();
  });
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

test('adds members to the group', async () => {
  render(
    renderWith([contactsListExcludeGroup, addMembersQuery, getWaGroupQuery, waGroupContacts, countWaGroupContacts])
  );

  await waitFor(() => {
    expect(screen.getByTestId('addMembers')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('addMembers'));

  // SearchDialogBox opens; pick the first contact once the query resolves
  const [autocompleteEl] = await screen.findAllByTestId('autocomplete-element');
  autocompleteEl.focus();
  fireEvent.keyDown(autocompleteEl, { key: 'ArrowDown' });
  fireEvent.click(await screen.findByText('Contact A'));

  fireEvent.click(screen.getByTestId('ok-button'));

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalled();
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

const openAddAndSelect = async () => {
  await waitFor(() => {
    expect(screen.getByTestId('addMembers')).toBeInTheDocument();
  });
  fireEvent.click(screen.getByTestId('addMembers'));

  const [autocompleteEl] = await screen.findAllByTestId('autocomplete-element');
  autocompleteEl.focus();
  fireEvent.keyDown(autocompleteEl, { key: 'ArrowDown' });
  fireEvent.click(await screen.findByText('Contact A'));

  fireEvent.click(screen.getByTestId('ok-button'));
};

test('warns when adding members returns errors', async () => {
  render(renderWith([contactsListExcludeGroup, addMembersErrorResponse]));
  await openAddAndSelect();

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalledWith('Could not add member', 'warning');
  });
});

test('warns when adding members errors out', async () => {
  render(renderWith([contactsListExcludeGroup, addMembersNetworkError]));
  await openAddAndSelect();

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalledWith('Could not add contacts to the group', 'warning');
  });
});

test('disables Save until a contact is selected', async () => {
  render(renderWith([contactsListExcludeGroup]));

  await waitFor(() => {
    expect(screen.getByTestId('addMembers')).toBeInTheDocument();
  });
  fireEvent.click(screen.getByTestId('addMembers'));
  await screen.findAllByTestId('autocomplete-element');

  // nothing selected yet -> the Save button is disabled
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
  render(renderWith([contactsListExcludeGroup]));

  await waitFor(() => {
    expect(screen.getByTestId('addMembers')).toBeInTheDocument();
  });
  fireEvent.click(screen.getByTestId('addMembers'));
  await screen.findAllByTestId('autocomplete-element');

  fireEvent.click(screen.getByTestId('cancel-button'));

  await waitFor(() => {
    expect(screen.queryByText('Add members to this group')).not.toBeInTheDocument();
  });
});

test('updates the member search term when typing', async () => {
  render(renderWith([contactsListExcludeGroup]));

  await waitFor(() => {
    expect(screen.getByTestId('addMembers')).toBeInTheDocument();
  });
  fireEvent.click(screen.getByTestId('addMembers'));
  const [autocompleteEl] = await screen.findAllByTestId('autocomplete-element');
  const input = autocompleteEl.querySelector('input') as HTMLInputElement;

  fireEvent.change(input, { target: { value: 'Co' } });

  await waitFor(() => {
    expect(input.value).toBe('Co');
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
