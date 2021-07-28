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
  const { container, getByTestId } = render(sidemenus);
  await waitFor(() => {
    expect(getByTestId('list')).toBeInTheDocument();
  });
});

test('it should mark notification as read on notification click', async () => {
  const { container, getAllByTestId } = render(sidemenus);
  await waitFor(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1));
  });
  const listItem = getAllByTestId('list-item');
  expect(listItem[7]).toBeInTheDocument();
  fireEvent.click(listItem[7]);
});
