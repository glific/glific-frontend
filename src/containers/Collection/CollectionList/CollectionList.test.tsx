import { render, waitFor, fireEvent, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { CollectionList } from './CollectionList';
import {
  countCollectionQuery,
  filterCollectionQuery,
  getCollectionContactsQuery,
} from '../../../mocks/Collection';
import { MemoryRouter } from 'react-router';
import { getContactsQuery } from '../../../mocks/Contact';
import { setUserSession } from '../../../services/AuthService';
import { getCurrentUserQuery } from '../../../mocks/User';
import * as SearchDialogBox from '../../../components/UI/SearchDialogBox/SearchDialogBox';
import { getPublishedFlowQuery } from '../../../mocks/Flow';

const mocks = [
  countCollectionQuery,
  filterCollectionQuery,
  filterCollectionQuery,
  getPublishedFlowQuery,
  getPublishedFlowQuery,
  getCollectionContactsQuery,
  getContactsQuery,
  getCurrentUserQuery,
];

// add mock for the resize observer
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = ResizeObserver;

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

    // TODO: test flows

    // TODO: test delete
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
      const input = screen.getByRole('textbox');
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

    const spy = jest.spyOn(SearchDialogBox, 'SearchDialogBox');
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
    fireEvent.click(getByTestId('searchDialogBox').querySelector('button'));
  });
});
