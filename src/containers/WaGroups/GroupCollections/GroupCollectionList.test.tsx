import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router';
import { vi } from 'vitest';

import { GroupCollectionList } from './GroupCollectionList';
import {
  countGroups,
  getGroups,
  getGroupsCollectionList,
  getGroupsCollections,
  getGroupsSearchQuery,
  updateCollectionWaGroupQuery,
  updateWaGroupCollection,
} from 'mocks/Groups';
import { setVariables } from 'common/constants';
import { setNotification } from 'common/notification';

let getCollectionsVariables = {
  filter: { includeGroups: '1' },
  opts: { limit: 50, offset: 0, order: 'ASC', orderWith: 'label' },
};

const mocks = [
  countGroups,
  getGroups,
  getGroupsCollections,
  updateWaGroupCollection,
  countGroups,
  getGroups,
  countGroups,
  countGroups,
  getGroupsCollectionList(getCollectionsVariables),
  getGroupsCollectionList(getCollectionsVariables),
  getGroupsSearchQuery(setVariables({ excludeGroups: '1' }, 50)),
  getGroupsSearchQuery(setVariables({ excludeGroups: '1' }, 50)),
  updateCollectionWaGroupQuery({
    input: { addWaGroupIds: ['1'], groupId: '1', deleteWaGroupIds: [] },
  }),
  updateCollectionWaGroupQuery({
    input: { groupId: '1', addWaGroupIds: [], deleteWaGroupIds: ['19'] },
  }),
];

vi.mock('react-router-dom', async () => {
  return {
    ...(await vi.importActual<any>('react-router-dom')),
    useParams: () => ({ id: '1' }),
  };
});

vi.mock('common/notification', async (importOriginal) => {
  const mod = await importOriginal<typeof import('common/notification')>();
  return {
    ...mod,
    setNotification: vi.fn((...args) => {
      return args[1];
    }),
  };
});

const wrapper = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter initialEntries={['/collection/1/groups']}>
      <GroupCollectionList />
    </MemoryRouter>
  </MockedProvider>
);

describe('<GroupCollectionList />', () => {
  test('should render Group label', async () => {
    const { getByTestId, getByText } = render(wrapper);

    expect(getByTestId('loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(getByText('Default WA Group Collection')).toBeInTheDocument();
    });
  });

  test('should render GroupCollectionList', async () => {
    const { getByTestId, getByText } = render(wrapper);

    expect(getByTestId('loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(getByText('Group 12')).toBeInTheDocument();
    });
  });

  test('should open and close dialog box', async () => {
    const { getByTestId, getByText } = render(wrapper);

    expect(getByTestId('loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(getByText('Group 12')).toBeInTheDocument();
    });

    fireEvent.click(getByTestId('addBtn'));

    const dialog = screen.getByTestId('dialogBox');

    await waitFor(() => {
      expect(dialog).toBeInTheDocument();
    });

    fireEvent.click(getByTestId('CloseIcon'));

    await waitFor(() => {
      expect(dialog).not.toBeInTheDocument();
    });
  });

  test('should add groups to collection', async () => {
    const { getByTestId, getByText } = render(wrapper);

    expect(getByTestId('loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(getByText('Group 12')).toBeInTheDocument();
    });

    fireEvent.click(getByTestId('addBtn'));

    const dialog = screen.getByTestId('dialogBox');

    await waitFor(() => {
      expect(dialog).toBeInTheDocument();
    });

    const autocomplete = getByTestId('autocomplete-element');
    autocomplete.focus();
    fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });
    fireEvent.keyDown(autocomplete, { key: 'Enter' });

    fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });
    fireEvent.keyDown(autocomplete, { key: 'Enter' });

    fireEvent.click(getByTestId('ok-button'));

    await waitFor(() => {
      expect(setNotification).toHaveBeenCalled();
    });
  });

  test('remove groups from collection', async () => {
    const { getByTestId, getByText } = render(wrapper);

    // loading is show initially
    expect(getByTestId('loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(getByText('Group 12')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');

    fireEvent.click(checkboxes[1]);

    fireEvent.click(getByTestId('deleteBtn'));
    fireEvent.click(getByTestId('CloseIcon'));
    fireEvent.click(getByTestId('deleteBtn'));

    await waitFor(() => {
      expect(screen.getByTestId('dialogBox')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('ok-button'));

    await waitFor(() => {
      expect(setNotification).toHaveBeenCalled();
    });
  });
});
