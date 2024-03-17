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
} from 'mocks/Collection';
import { getContactsQuery, getContactsSearchQuery } from 'mocks/Contact';
import { getCurrentUserQuery } from 'mocks/User';
import { getPublishedFlowQuery } from 'mocks/Flow';
import { setUserSession } from 'services/AuthService';
import * as SearchDialogBox from 'components/UI/SearchDialogBox/SearchDialogBox';
import { CollectionList } from './CollectionList';
import * as utils from 'common/utils';
import { getGroupsSearchQuery } from 'mocks/Groups';

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
  exportCollectionsQuery,
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

    const spy = vi.spyOn(SearchDialogBox, 'SearchDialogBox');
    spy.mockImplementation((props: any) => {
      const { handleCancel, onChange } = props;
      return (
        <div data-testid="searchDialogBox">
          <input onChange={(value) => onChange(value)} />
          <button onClick={() => handleCancel()} />
        </div>
      );
    });

    const { getAllByTestId, getByTestId } = render(wrapper);

    // loading is show initially
    expect(getByTestId('loading')).toBeInTheDocument();
    await waitFor(() => {
      fireEvent.click(getAllByTestId('additionalButton')[0]);
    });
    fireEvent.click(getByTestId('searchDialogBox').querySelector('button') as HTMLElement);
  });

  test('it has number of contacts', async () => {
    const { getByText, getByTestId, getAllByTestId } = render(wrapper);

    expect(getByTestId('loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(getAllByTestId('additionalButton')[0]).toBeInTheDocument();
    });

    expect(getByText('2 contacts')).toBeInTheDocument();
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
          getGroupsSearchQuery,
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

  test('should export collection', async () => {
    const { getByTestId } = render(wrapper);
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
});
