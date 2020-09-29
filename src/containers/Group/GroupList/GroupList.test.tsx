import React from 'react';
import { render, screen, wait } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';
import { MockedProvider } from '@apollo/client/testing';

import { GroupList } from './GroupList';
import { countGroupQuery, filterGroupQuery } from '../../../mocks/Group';

const mocks = [countGroupQuery, filterGroupQuery];

const wrapper = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <GroupList />
  </MockedProvider>
);

describe('<GroupList />', () => {
  test('should render GroupList', async () => {
    const { getByText } = render(wrapper);

    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();

    await wait();
    expect(getByText('Groups')).toBeInTheDocument();

    // test automation

    // TODO: test delete
  });
});
