import { render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router';

import { countCollectionContactsQuery, getCollectionContactsQuery } from 'mocks/Contact';
import { setUserSession } from 'services/AuthService';
import { CollectionContactList } from './CollectionContactList';

jest.mock('react-router-dom', () => {
  return {
    ...jest.requireActual('react-router-dom'),
    useParams: () => ({ id: 1 }),
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
    const { getByText } = render(wrapper);

    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(getByText('Glific User')).toBeInTheDocument();
    });
  });
});
