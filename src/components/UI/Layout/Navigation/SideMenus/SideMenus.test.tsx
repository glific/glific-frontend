import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import { fireEvent, render, waitFor } from '@testing-library/react';

import SideMenus from './SideMenus';
import { getCurrentUserQuery } from '../../../../../mocks/User';
import {
  getNotificationCountQuery,
  markAllNotificationAsRead,
} from '../../../../../mocks/Notifications';
import { MockedProvider } from '@apollo/client/testing';
import { setUserSession } from '../../../../../services/AuthService';

const mocks = [getCurrentUserQuery, getNotificationCountQuery, markAllNotificationAsRead];
setUserSession(JSON.stringify({ roles: ['Admin'] }));

const sidemenus = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <SideMenus opened={true} />
    </Router>
  </MockedProvider>
);

test('it should be initialized properly', async () => {
  const { container, getByTestId } = render(sidemenus);
  await waitFor(() => {
    expect(getByTestId('list')).toBeInTheDocument();
  });
});

test('it should mark notification as read on notification click', async () => {
  const { container, getAllByTestId } = render(sidemenus);
  await waitFor(() => {
    const listItem = getAllByTestId('list-item');
    expect(listItem[7]).toBeInTheDocument();
    fireEvent.click(listItem[7]);
  });
});
