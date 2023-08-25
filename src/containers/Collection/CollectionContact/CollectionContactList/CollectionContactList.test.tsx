import { render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router';
import { vi } from 'vitest';

import { countCollectionContactsQuery, getCollectionContactsQuery } from 'mocks/Contact';
import { setUserSession } from 'services/AuthService';
import { CollectionContactList } from './CollectionContactList';

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
});
