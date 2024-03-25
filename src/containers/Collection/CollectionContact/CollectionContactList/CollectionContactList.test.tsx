import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router';
import { vi } from 'vitest';

import { countCollectionContactsQuery, getCollectionContactsQuery } from 'mocks/Contact';
import { setUserSession } from 'services/AuthService';
import { CollectionContactList } from './CollectionContactList';
import { deleteContactFromCollection } from 'mocks/Collection';

vi.mock('react-router-dom', async () => {
  return {
    ...(await vi.importActual<any>('react-router-dom')),
    useParams: () => ({ id: '1' }),
  };
});

const mocks = [
  countCollectionContactsQuery,
  getCollectionContactsQuery({
    filter: { includeGroups: '1' },
    opts: {
      limit: 50,
      offset: 0,
      order: 'ASC',
      orderWith: 'name',
    },
  }),
  getCollectionContactsQuery({
    filter: { includeGroups: '1' },
    opts: {
      limit: 50,
      offset: 0,
      order: 'ASC',
      orderWith: 'name',
    },
  }),
  deleteContactFromCollection,
  countCollectionContactsQuery,
  countCollectionContactsQuery,
  countCollectionContactsQuery,
  getCollectionContactsQuery({
    filter: { name: '', includeGroups: ['1'] },
    opts: { limit: 50, offset: 0, order: 'ASC' },
  }),
  getCollectionContactsQuery({
    filter: { includeGroups: '1' },
    opts: {
      limit: 50,
      offset: 0,
      order: 'ASC',
      orderWith: 'name',
    },
  }),
  getCollectionContactsQuery({
    filter: { includeGroups: '1' },
    opts: {
      limit: 50,
      offset: 0,
      order: 'ASC',
      orderWith: 'name',
    },
  }),
];
const wrapper = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter>
      <CollectionContactList title={'Default Collection'} />
    </MemoryRouter>
  </MockedProvider>
);

describe('<CollectionContactList />', () => {
  test('should render CollectionContactList', async () => {
    setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Admin'] }));
    const { getByTestId, getByText } = render(wrapper);

    // loading is show initially
    expect(getByTestId('loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(getByText('Glific User')).toBeInTheDocument();
    });
  });

  test('delete contact from collection', async () => {
    const { getByTestId, getByText, getAllByTestId } = render(wrapper);

    // loading is show initially
    expect(getByTestId('loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(getByText('Glific User')).toBeInTheDocument();
    });

    fireEvent.click(getAllByTestId('MoreIcon')[0]);
    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(screen.getByTestId('dialogBox')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('ok-button'));

    await waitFor(() => {
      // expect(setNotification).toHaveBeenCalled();
    });
  });

  test('remove contacts', async () => {
    const { getByTestId, getByText } = render(wrapper);

    expect(getByTestId('loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(getByText('Glific User')).toBeInTheDocument();
    });

    fireEvent.click(getByTestId('removeBtn'));

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
      expect(dialog).not.toBeInTheDocument();
    });
  });

  test('closes dialog box', async () => {
    const { getByTestId, getByText } = render(wrapper);

    expect(getByTestId('loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(getByText('Glific User')).toBeInTheDocument();
    });

    fireEvent.click(getByTestId('removeBtn'));

    const dialog = screen.getByTestId('dialogBox');

    await waitFor(() => {
      expect(dialog).toBeInTheDocument();
    });

    fireEvent.click(getByTestId('cancel-button'));

    await waitFor(() => {
      expect(dialog).not.toBeInTheDocument();
    });
  });
});
