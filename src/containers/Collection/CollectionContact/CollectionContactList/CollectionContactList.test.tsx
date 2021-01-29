import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router';

import { GroupContactList } from './CollectionContactList';
import { countGroupContactsQuery, getGroupContactsQuery } from '../../../../mocks/Contact';
import { setUserSession } from '../../../../services/AuthService';

const mocks = [countGroupContactsQuery, getGroupContactsQuery, getGroupContactsQuery];
const wrapper = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter>
      <GroupContactList match={{ params: { id: 1 } }} title={'Default Group'} />
    </MemoryRouter>
  </MockedProvider>
);

describe('<GroupContactList />', () => {
  test('should render GroupContactList', async () => {
    setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Admin'] }));
    const { getByText } = render(wrapper);

    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(getByText('Glific User')).toBeInTheDocument();
    });
  });
});
