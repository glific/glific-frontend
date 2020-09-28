import React from 'react';
import { render, screen, wait } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';
import { MockedProvider } from '@apollo/client/testing';

import { Group } from './Group';
import { getGroupQuery, getGroupsQuery, getGroupUsersQuery } from '../../mocks/Group';
import { getUsersQuery } from '../../mocks/User';
import { getOrganizationQuery } from '../../mocks/Organization';

const mocks = [
  getUsersQuery,
  ...getOrganizationQuery,
  getGroupQuery,
  getGroupQuery, // if you refetch then you need to include same mock twice, learnt it hard way
  getGroupUsersQuery,
  getGroupsQuery,
];

const wrapper = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Group match={{ params: { id: 1 } }} />
  </MockedProvider>
);

describe('<Group />', () => {
  test('should render Group', async () => {
    const { getByText } = render(wrapper);

    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();

    await wait();
    expect(getByText('Edit group')).toBeInTheDocument();
  });
});
