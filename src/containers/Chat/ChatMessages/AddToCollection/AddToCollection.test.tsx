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
  updateCollectionContactsQuery,
  getExcludedContactsQuery('1'),
];

setUserSession(JSON.stringify({ roles: ['Admin'] }));

const setDialogMock = vi.fn();
const defaultProps = {
  collectionId: '1',
  setDialog: setDialogMock,
};

afterEach(cleanup);

const addContacts = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <AddToCollection {...defaultProps} />
  </MockedProvider>
);

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

test('should add contact to collection', async () => {
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
    expect(setNotification).toHaveBeenCalled();
  });
});

const groupsmocks = [
  getCollectionContactsQuery,
  getGroupsSearchQuery(setVariables({}, 50)),
  getGroupsQuery,
  updateCollectionWaGroupQuery({
    input: { addWaGroupIds: ['5'], groupId: '1', deleteWaGroupIds: [] },
  }),
  getGroupsSearchQuery(setVariables({ excludeGroups: '1' }, 50)),
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

test('should add whatsapp group to collection', async () => {
  const { getByTestId, getByText } = render(addGroups);

  await waitFor(() => {
    expect(getByTestId('autocomplete-element')).toBeInTheDocument();
  });

  const autocomplete = getByTestId('autocomplete-element');
  autocomplete.focus();
  fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });
  fireEvent.click(autocomplete, { key: 'Enter' });

  fireEvent.click(getByText('Save'));

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalled();
  });
});
