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
  getCollectionContactsQuery,
  getCollectionContactsQuery,
  deleteContactFromCollection,
  countCollectionContactsQuery,
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
    const { getAllByTestId, getByTestId, getByText } = render(wrapper);

    // loading is show initially
    expect(getByTestId('loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(getByText('Glific User')).toBeInTheDocument();
    });

    fireEvent.click(getByTestId('MoreIcon'));
    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(screen.getByTestId('dialogBox')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('ok-button'));

    await waitFor(() => {
      // expect(setNotification).toHaveBeenCalled();
    });
  });
});
