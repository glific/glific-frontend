import React from 'react';
import { render, wait } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router';

import { GroupContactList } from './GroupContactList';
import { countGroupContactsQuery } from '../../../../mocks/Contact';

const mocks = [countGroupContactsQuery];
const wrapper = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter>
      <GroupContactList match={{ params: { id: 1 } }} title={'Default Group'} />
    </MemoryRouter>
  </MockedProvider>
);

describe('<GroupContactList />', () => {
  test('should render GroupContactList', async () => {
    const { getByText } = render(wrapper);

    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();

    await wait();
    await wait();
    expect(getByText('Back to all groups')).toBeInTheDocument();
  });
});
