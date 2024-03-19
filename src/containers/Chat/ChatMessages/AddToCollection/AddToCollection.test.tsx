import { AddToCollection } from './AddToCollection';
import { render, cleanup, waitFor, fireEvent } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { vi } from 'vitest';

import { setUserSession } from 'services/AuthService';
import { getCollectionContactsQuery, updateCollectionContactsQuery } from 'mocks/Collection';
import { getContactsQuery, getContactsSearchQuery } from 'mocks/Contact';
import { setNotification } from 'common/notification';
import { getGroupsQuery, getGroupsSearchQuery, updateCollectionWaGroupQuery } from 'mocks/Groups';

const mocks = [
  getCollectionContactsQuery,
  getCollectionContactsQuery,
  getContactsSearchQuery,
  getContactsQuery,
  updateCollectionContactsQuery,
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

  expect(getByTestId('loading')).toBeInTheDocument();

  await waitFor(() => {
    expect(getByTestId('autocomplete-element')).toBeInTheDocument();
  });
  expect(getByText('Add contacts to the collection')).toBeInTheDocument();
  await waitFor(() => {
    expect(getByText('Glific User')).toBeInTheDocument();
  });
});

test('click on cancel button ', async () => {
  const { getByText, getByTestId } = render(addContacts);

  expect(getByTestId('loading')).toBeInTheDocument();

  await waitFor(() => {
    expect(getByTestId('autocomplete-element')).toBeInTheDocument();
  });

  fireEvent.click(getByText('Cancel'));

  expect(setDialogMock).toHaveBeenCalled();
});

test('save without changing anything', async () => {
  const { getByText, getByTestId } = render(addContacts);

  expect(getByTestId('loading')).toBeInTheDocument();

  await waitFor(() => {
    expect(getByTestId('autocomplete-element')).toBeInTheDocument();
  });

  await waitFor(() => {
    expect(getByText('Glific User')).toBeInTheDocument();
  });

  fireEvent.click(getByText('Save'));
});

test('change value in dialog box', async () => {
  const { getByTestId, getAllByTestId } = render(addContacts);

  expect(getByTestId('loading')).toBeInTheDocument();

  await waitFor(() => {
    expect(getByTestId('autocomplete-element')).toBeInTheDocument();
  });

  const autocomplete = getByTestId('autocomplete-element');
  autocomplete.focus();
  fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });

  fireEvent.keyDown(autocomplete, { key: 'Enter' });

  await waitFor(() => {
    expect(getAllByTestId('searchChip')[0]).toHaveTextContent('Glific User');
  });
});

test('should add contact to collection', async () => {
  const { getByTestId, getByText } = render(addContacts);

  expect(getByTestId('loading')).toBeInTheDocument();

  await waitFor(() => {
    expect(getByTestId('autocomplete-element')).toBeInTheDocument();
  });

  const autocomplete = getByTestId('autocomplete-element');
  autocomplete.focus();
  fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });

  fireEvent.click(getByText('Glific User 2'), { key: 'Enter' });
  fireEvent.click(getByText('Save'));

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalled();
  });
});

const groupsmocks = [
  getCollectionContactsQuery,
  getGroupsSearchQuery,
  getGroupsQuery,
  updateCollectionWaGroupQuery,
];

const addGroups = (
  <MockedProvider mocks={groupsmocks} addTypename={false}>
    <AddToCollection {...defaultProps} groups={true} />
  </MockedProvider>
);

test('it should have "add group to collection" dialog box ', async () => {
  const { getByText, getByTestId } = render(addGroups);

  expect(getByTestId('loading')).toBeInTheDocument();

  await waitFor(() => {
    expect(getByTestId('autocomplete-element')).toBeInTheDocument();
  });

  expect(getByText('Add groups to the collection')).toBeInTheDocument();
});

test('should add whatsapp group to collection', async () => {
  const { getByTestId, getByText } = render(addGroups);

  expect(getByTestId('loading')).toBeInTheDocument();

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
