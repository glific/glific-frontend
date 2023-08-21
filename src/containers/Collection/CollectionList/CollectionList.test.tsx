import { render, waitFor, fireEvent, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router';
import { vi } from 'vitest';

import {
  countCollectionQuery,
  filterCollectionQuery,
  getCollectionContactsQuery,
} from 'mocks/Collection';
import { getContactsQuery, getContactsSearchQuery } from 'mocks/Contact';
import { getCurrentUserQuery } from 'mocks/User';
import { getPublishedFlowQuery } from 'mocks/Flow';
import { setUserSession } from 'services/AuthService';
import * as SearchDialogBox from 'components/UI/SearchDialogBox/SearchDialogBox';
import { CollectionList } from './CollectionList';

const mocks = [
  countCollectionQuery,
  filterCollectionQuery,
  filterCollectionQuery,
  getPublishedFlowQuery,
  getPublishedFlowQuery,
  getCollectionContactsQuery,
  getContactsQuery,
  getContactsSearchQuery,
  getCurrentUserQuery,
];

const wrapper = (
  <MemoryRouter>
    <MockedProvider mocks={mocks} addTypename={false}>
      <CollectionList />
    </MockedProvider>
  </MemoryRouter>
);

describe('<CollectionList />', () => {
  test('should render CollectionList', async () => {
    const { getByText } = render(wrapper);

    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(getByText('Collections')).toBeInTheDocument();
    });
  });

  test('it should have add contact to collection dialog box ', async () => {
    setUserSession(JSON.stringify({ roles: ['Staff'] }));
    const { getByText, getAllByTestId } = render(wrapper);

    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();
    await waitFor(() => {
      expect(getAllByTestId('additionalButton')[0]).toBeInTheDocument();
    });

    await waitFor(() => {
      fireEvent.click(getAllByTestId('additionalButton')[0]);
    });

    expect(getByText('Add contacts to the collection')).toBeInTheDocument();
    const autocomplete = screen.getByTestId('autocomplete-element');
    expect(autocomplete).toBeInTheDocument();

    await waitFor(() => {
      const input = screen.getByRole('combobox');
      fireEvent.change(input, { target: { value: 'glific' } });
    });

    autocomplete.focus();
    fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });
    await waitFor(() => {});

    // select the first item
    fireEvent.keyDown(autocomplete, { key: 'Enter' });
    await waitFor(() => {});

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

    const { getByText, getAllByTestId, getByTestId } = render(wrapper);

    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();
    await waitFor(() => {
      fireEvent.click(getAllByTestId('additionalButton')[0]);
    });
    fireEvent.click(getByTestId('searchDialogBox').querySelector('button') as HTMLElement);
  });
});
