import { render, waitFor, fireEvent, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter, Route, Routes } from 'react-router';
import { vi } from 'vitest';

import {
  countCollectionQuery,
  countCollectionQueryWAGroups,
  exportCollectionsQuery,
  filterCollectionQuery,
  filterCollectionQueryWAGroups,
  getCollectionContactsQuery,
  addContactToCollection,
  exportCollectionsQueryWithErrors,
} from 'mocks/Collection';
import { getContactsQuery, getContactsSearchQuery, getExcludedContactsQuery } from 'mocks/Contact';
import { getCurrentUserQuery } from 'mocks/User';
import { getPublishedFlowQuery } from 'mocks/Flow';
import { setUserSession } from 'services/AuthService';
import { CollectionList } from './CollectionList';
import * as utils from 'common/utils';
import {
  addGroupToCollectionList,
  getGroupsSearchQuery,
  updateCollectionWaGroupQuery,
} from 'mocks/Groups';
import { setNotification } from 'common/notification';
import { setVariables } from 'common/constants';

const mocks = [
  countCollectionQuery,
  countCollectionQuery,
  countCollectionQuery,
  filterCollectionQuery,
  filterCollectionQuery,
  filterCollectionQuery,
  getPublishedFlowQuery,
  getPublishedFlowQuery,
  getCollectionContactsQuery,
  getContactsQuery,
  getContactsSearchQuery,
  getCurrentUserQuery,
  addContactToCollection,
  getCollectionContactsQuery,
  updateCollectionWaGroupQuery({
    input: { addWaGroupIds: ['1'], groupId: '1', deleteWaGroupIds: [] },
  }),
  getExcludedContactsQuery('1'),
];

const wrapper = (
  <MemoryRouter>
    <MockedProvider mocks={mocks} addTypename={false}>
      <CollectionList />
    </MockedProvider>
  </MemoryRouter>
);

const mockedUsedNavigate = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockedUsedNavigate,
}));

vi.mock('common/notification', async (importOriginal) => {
  const mod = await importOriginal<typeof import('common/notification')>();
  return {
    ...mod,
    setNotification: vi.fn(),
  };
});

describe('<CollectionList />', () => {
  test('should render CollectionList', async () => {
    const { getByText, getByTestId } = render(wrapper);

    // loading is show initially
    expect(getByTestId('loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(getByText('Collections')).toBeInTheDocument();
    });
  });

  test('it should have add contact to collection dialog box ', async () => {
    setUserSession(JSON.stringify({ roles: ['Staff'] }));
    const { getByText, getByTestId, getAllByTestId } = render(wrapper);

    // loading is show initially
    expect(getByTestId('loading')).toBeInTheDocument();
    await waitFor(() => {
      expect(getAllByTestId('additionalButton')[0]).toBeInTheDocument();
    });

    fireEvent.click(getAllByTestId('additionalButton')[0]);

    await waitFor(() => {
      expect(getByText('Add contacts to the collection')).toBeInTheDocument();
    });

    const autocomplete = screen.getByTestId('autocomplete-element');

    await waitFor(() => {
      expect(autocomplete).toBeInTheDocument();
    });

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'glific' } });

    autocomplete.focus();
    fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });
    fireEvent.keyDown(autocomplete, { key: 'Enter' });

    const save = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(save);

    await waitFor(() => {});
  });

  test('add contacts to collection', async () => {
    setUserSession(JSON.stringify({ roles: ['Admin'] }));
    const { getAllByTestId, getByTestId, getByText } = render(wrapper);

    // loading is show initially
    expect(getByTestId('loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(getByText('Staff group')).toBeInTheDocument();
    });

    fireEvent.click(getAllByTestId('additionalButton')[0]);

    await waitFor(() => {
      expect(screen.getByTestId('dialogBox')).toBeInTheDocument();
    });

    const autocomplete = getByTestId('autocomplete-element');
    autocomplete.focus();
    fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });
    fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });

    fireEvent.keyDown(autocomplete, { key: 'Enter' });

    fireEvent.click(screen.getByTestId('ok-button'));

    await waitFor(() => {
      expect(setNotification).toHaveBeenCalled();
    });
  });

  test('it has number of contacts', async () => {
    const { getByText, getByTestId, getAllByTestId } = render(wrapper);

    expect(getByTestId('loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(getAllByTestId('additionalButton')[0]).toBeInTheDocument();
    });

    expect(getByText('2 contacts')).toBeInTheDocument();
  });

  test('should export collection', async () => {
    const { getByTestId } = render(
      <MemoryRouter>
        <MockedProvider mocks={[...mocks, exportCollectionsQuery]} addTypename={false}>
          <CollectionList />
        </MockedProvider>
      </MemoryRouter>
    );
    expect(getByTestId('loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(getByTestId('additionalButton')).toBeInTheDocument();
    });

    fireEvent.click(getByTestId('MoreIcon'));
    fireEvent.click(screen.getByText('Export'));
    const spy = vi.spyOn(utils, 'exportCsvFile');

    await waitFor(() => {
      expect(spy).toHaveBeenCalled();
    });
  });

  test('should show error if export collection failed', async () => {
    const { getByTestId } = render(
      <MemoryRouter>
        <MockedProvider mocks={[...mocks, exportCollectionsQueryWithErrors]} addTypename={false}>
          <CollectionList />
        </MockedProvider>
      </MemoryRouter>
    );
    expect(getByTestId('loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(getByTestId('additionalButton')).toBeInTheDocument();
    });

    fireEvent.click(getByTestId('MoreIcon'));
    fireEvent.click(screen.getByText('Export'));

    await waitFor(() => {
      expect(setNotification).toHaveBeenCalled();
    });
  });

  const groupWrapper = (
    <MemoryRouter initialEntries={['/group/collection']}>
      <MockedProvider
        mocks={[
          ...mocks,
          filterCollectionQueryWAGroups,
          filterCollectionQueryWAGroups,
          countCollectionQueryWAGroups,
          countCollectionQueryWAGroups,
          getGroupsSearchQuery(setVariables({}, 50)),
          getGroupsSearchQuery(setVariables({ label: '', excludeGroups: '1' }, 50)),
          addGroupToCollectionList,
          filterCollectionQueryWAGroups,
          countCollectionQueryWAGroups,
        ]}
        addTypename={false}
      >
        <Routes>
          <Route path="group/collection" element={<CollectionList />} />
        </Routes>
      </MockedProvider>
    </MemoryRouter>
  );

  test('should render CollectionList for whatsapp groups', async () => {
    const { getByText, getByTestId } = render(groupWrapper);

    expect(getByTestId('loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(getByText('Group Collections')).toBeInTheDocument();
      expect(getByText('Default WA Group Collection')).toBeInTheDocument();
    });
  });

  test('it has number of whatsapp groups', async () => {
    const { getByTestId, getAllByTestId, getByText } = render(groupWrapper);

    expect(getByTestId('loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(getAllByTestId('additionalButton')[0]).toBeInTheDocument();
    });

    const viewButton = getAllByTestId('additionalButton')[0];
    fireEvent.click(viewButton);

    await waitFor(() => {
      expect(getByText('1 group')).toBeInTheDocument();
    });
  });

  test('add groups to collection', async () => {
    setUserSession(JSON.stringify({ roles: ['Staff'] }));
    const { getAllByTestId, getByTestId, getByText } = render(groupWrapper);

    // loading is show initially
    expect(getByTestId('loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(getByText('Group Collections')).toBeInTheDocument();
    });

    fireEvent.click(getAllByTestId('additionalButton')[0]);

    await waitFor(() => {
      expect(screen.getByTestId('dialogBox')).toBeInTheDocument();
    });

    const autocomplete = getByTestId('autocomplete-element');
    autocomplete.focus();
    fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });
    fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });

    fireEvent.keyDown(autocomplete, { key: 'Enter' });

    fireEvent.click(screen.getByTestId('ok-button'));

    await waitFor(() => {
      expect(setNotification).toHaveBeenCalled();
    });
  });

  test('closes the dialog box', async () => {
    const { getAllByTestId, getByTestId, getByText } = render(groupWrapper);

    // loading is show initially
    expect(getByTestId('loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(getByText('Group Collections')).toBeInTheDocument();
    });

    fireEvent.click(getAllByTestId('additionalButton')[0]);

    const dialog = screen.getByTestId('dialogBox');

    await waitFor(() => {
      expect(dialog).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('cancel-button'));

    await waitFor(() => {
      expect(dialog).not.toBeInTheDocument();
    });
  });
});
