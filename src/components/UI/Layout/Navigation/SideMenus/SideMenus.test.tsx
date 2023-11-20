import { BrowserRouter as Router } from 'react-router-dom';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import { getNotificationCountQuery, markAllNotificationAsRead } from 'mocks/Notifications';
import { setUserSession } from 'services/AuthService';
import SideMenus from './SideMenus';

const mocks = [getNotificationCountQuery, markAllNotificationAsRead];
setUserSession(JSON.stringify({ roles: ['Admin'] }));

const sidemenus = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <SideMenus opened={true} />
    </Router>
  </MockedProvider>
);

test('it should be initialized properly', async () => {
  const { getByTestId } = render(sidemenus);
  await waitFor(() => {
    expect(getByTestId('list')).toBeInTheDocument();
  });
});

test('it should mark notification as read on notification click', async () => {
  const { getAllByTestId, getByTestId } = render(sidemenus);
  await waitFor(() => {
    expect(getByTestId('list')).toBeInTheDocument();
  });
  const listItem = getAllByTestId('list-item');
  expect(listItem[3]).toBeInTheDocument();
  fireEvent.click(listItem[3]);
});
