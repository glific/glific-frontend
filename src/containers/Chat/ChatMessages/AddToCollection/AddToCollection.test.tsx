import { AddToCollection } from './AddToCollection';
import { render, cleanup, waitFor, fireEvent } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { vi } from 'vitest';

import { setUserSession } from 'services/AuthService';
import { getCollectionContactsQuery, updateCollectionContactsQuery } from 'mocks/Collection';
import { getContactsQuery, getContactsSearchQuery, getExcludedContactsQuery } from 'mocks/Contact';
import { setNotification } from 'common/notification';
import { getGroupsQuery, getGroupsSearchQuery, updateCollectionWaGroupQuery } from 'mocks/Groups';
import { setVariables } from 'common/constants';

const mocks = [
  getCollectionContactsQuery,
  getCollectionContactsQuery,
  getContactsSearchQuery,
  getContactsQuery,
  updateCollectionContactsQuery(),
  getExcludedContactsQuery({
    name: '',
    excludeGroups: '1',
  }),
];

setUserSession(JSON.stringify({ roles: ['Admin'] }));

const setDialogMock = vi.fn();
const defaultProps = {
  collectionId: '1',
  setDialog: setDialogMock,
};

afterEach(cleanup);

const renderAddToCollection = (
  testMocks: any[] = mocks,
  props: Partial<Parameters<typeof AddToCollection>[0]> = {}
) => (
  <MockedProvider mocks={testMocks} addTypename={false}>
    <AddToCollection {...defaultProps} {...props} />
  </MockedProvider>
);

const addContacts = renderAddToCollection();

vi.mock('common/notification', async (importOriginal) => {
  const mod = await importOriginal<typeof import('common/notification')>();
  return {
    ...mod,
    setNotification: vi.fn(),
  };
});

test('it should have add contact to collection dialog box ', async () => {
  const { getByText, getByTestId } = render(addContacts);

  await waitFor(() => {
    expect(getByTestId('autocomplete-element')).toBeInTheDocument();
  });

  await waitFor(() => {
    expect(getByText('Add contacts to the collection')).toBeInTheDocument();
  });
});

test('click on cancel button ', async () => {
  const { getByText, getByTestId } = render(addContacts);

  await waitFor(() => {
    expect(getByTestId('autocomplete-element')).toBeInTheDocument();
  });

  fireEvent.click(getByText('Cancel'));

  expect(setDialogMock).toHaveBeenCalled();
});

test('save without changing anything', async () => {
  const { getByText, getByTestId } = render(addContacts);

  await waitFor(() => {
    expect(getByTestId('autocomplete-element')).toBeInTheDocument();
  });

  fireEvent.click(getByText('Save'));
});

test('should add contact to collection (singular notification)', async () => {
  const { getByTestId, getByText } = render(addContacts);

  await waitFor(() => {
    expect(getByTestId('autocomplete-element')).toBeInTheDocument();
  });

  const autocomplete = getByTestId('autocomplete-element');
  autocomplete.focus();
  fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });

  fireEvent.click(getByText('NGO Manager'), { key: 'Enter' });
  fireEvent.click(getByText('Save'));

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalledWith('1 contact added');
  });
  expect(setDialogMock).toHaveBeenCalledWith(false);
});

test('does not show notification when mutation succeeds with no additions', async () => {
  vi.mocked(setNotification).mockClear();
  const emptyAddMocks = [
    getCollectionContactsQuery,
    getCollectionContactsQuery,
    getContactsSearchQuery,
    getContactsQuery,
    updateCollectionContactsQuery({ addContactIds: ['3'], groupId: '1', deleteContactIds: [] }, { groupContacts: [] }),
    getExcludedContactsQuery({ name: '', excludeGroups: '1' }),
  ];

  const { getByTestId, getByText } = render(renderAddToCollection(emptyAddMocks));

  await waitFor(() => {
    expect(getByTestId('autocomplete-element')).toBeInTheDocument();
  });

  const autocomplete = getByTestId('autocomplete-element');
  autocomplete.focus();
  fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });
  fireEvent.click(getByText('NGO Manager'), { key: 'Enter' });
  fireEvent.click(getByText('Save'));

  await waitFor(() => {
    expect(setDialogMock).toHaveBeenCalledWith(false);
  });
  expect(setNotification).not.toHaveBeenCalled();
});

test('invokes afterAdd callback when provided', async () => {
  vi.mocked(setNotification).mockClear();
  const afterAddMock = vi.fn();
  const { getByTestId, getByText } = render(renderAddToCollection(mocks, { afterAdd: afterAddMock }));

  await waitFor(() => {
    expect(getByTestId('autocomplete-element')).toBeInTheDocument();
  });

  const autocomplete = getByTestId('autocomplete-element');
  autocomplete.focus();
  fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });
  fireEvent.click(getByText('NGO Manager'), { key: 'Enter' });
  fireEvent.click(getByText('Save'));

  await waitFor(() => {
    expect(afterAddMock).toHaveBeenCalled();
  });
});

const groupsmocks = [
  getCollectionContactsQuery,
  getGroupsQuery,
  updateCollectionWaGroupQuery({
    input: { addWaGroupIds: ['5'], groupId: '1', deleteWaGroupIds: [] },
  }),
  getGroupsSearchQuery(setVariables({ excludeGroups: '1', term: '' }, 50)),
];

const addGroups = (
  <MockedProvider mocks={groupsmocks} addTypename={false}>
    <AddToCollection {...defaultProps} groups={true} />
  </MockedProvider>
);

test('it should have "add group to collection" dialog box ', async () => {
  const { getByText, getByTestId } = render(addGroups);

  await waitFor(() => {
    expect(getByTestId('autocomplete-element')).toBeInTheDocument();
  });

  expect(getByText('Add groups to the collection')).toBeInTheDocument();
});

test('uses plural form when multiple whatsapp groups are added', async () => {
  vi.mocked(setNotification).mockClear();
  const pluralGroupMocks = [
    getCollectionContactsQuery,
    getGroupsQuery,
    updateCollectionWaGroupQuery(
      { input: { addWaGroupIds: ['5'], groupId: '1', deleteWaGroupIds: [] } },
      {
        groupContacts: [
          { id: '5', __typename: 'WaGroupsCollection' },
          { id: '6', __typename: 'WaGroupsCollection' },
        ],
      }
    ),
    getGroupsSearchQuery(setVariables({ excludeGroups: '1', term: '' }, 50)),
  ];

  const { getByTestId, getByText } = render(
    <MockedProvider mocks={pluralGroupMocks} addTypename={false}>
      <AddToCollection {...defaultProps} groups={true} />
    </MockedProvider>
  );

  await waitFor(() => {
    expect(getByTestId('autocomplete-element')).toBeInTheDocument();
  });

  const autocomplete = getByTestId('autocomplete-element');
  autocomplete.focus();
  fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });
  fireEvent.click(getByText('Group 1'), { key: 'Enter' });
  fireEvent.click(getByText('Save'));

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalledWith('2 groups were added');
  });
});

test('should close dialog box if nothing is selected', async () => {
  const { getByTestId, getByText } = render(addGroups);

  let dialog = getByTestId('autocomplete-element');

  await waitFor(() => {
    expect(dialog).toBeInTheDocument();
  });

  fireEvent.click(getByText('Save'));

  await waitFor(() => {
    expect(setDialogMock).toHaveBeenCalledWith(false);
  });
});
