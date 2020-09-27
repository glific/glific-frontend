import React from 'react';
import { render, screen, wait } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';
import { MockedProvider } from '@apollo/client/testing';

import { Group } from './Group';
import { getGroupsQuery } from '../../mocks/Group';
import { getUsersQuery } from '../../mocks/User';

const mocks = [getGroupsQuery, getUsersQuery];

const wrapper = (
  <MockedProvider mocks={mocks}>
    <Group match={{ params: { id: 1 } }} />
  </MockedProvider>
);

describe('<Group />', () => {
  test('should render Group', async () => {
    const { getByText } = render(wrapper);

    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();

    await wait();
    screen.debug();
    expect(getByText('Groups')).toBeInTheDocument();
  });
});
