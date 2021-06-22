import { render, waitFor, fireEvent, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';

import { NotificationList } from './NotificationList';
import {
  getUnFitleredNotificationCountQuery,
  getFilteredNotificationsQuery,
  getNotificationsQuery,
  getCountWithFilter,
  getCountWithEmptyFilter,
  markAllNotificationAsRead,
} from '../../mocks/Notifications';
import { setUserSession } from '../../services/AuthService';

setUserSession(JSON.stringify({ roles: ['Admin'] }));

const mocks: any = [
  getUnFitleredNotificationCountQuery,
  getNotificationsQuery,
  getUnFitleredNotificationCountQuery,
  getCountWithFilter,
  getCountWithEmptyFilter,
  markAllNotificationAsRead,
  getFilteredNotificationsQuery,
];

const notifications = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <NotificationList />
    </Router>
  </MockedProvider>
);

test('It should load notifications', async () => {
  const { getByText } = render(notifications);

  expect(getByText('Loading...')).toBeInTheDocument();

  await waitFor(() => {});
  await waitFor(() => {});

  await waitFor(() => {
    expect(getByText('Notifications')).toBeInTheDocument();
  });

  const time = await screen.findByText('TIMESTAMP');
  const category = await screen.findByText('CATEGORY');
  const severity = await screen.findByText('SEVERITY');
  const entity = await screen.findByText('ENTITY');
  const message = await screen.findByText('MESSAGE');

  expect(time).toBeInTheDocument();
  expect(category).toBeInTheDocument();
  expect(severity).toBeInTheDocument();
  expect(entity).toBeInTheDocument();
  expect(message).toBeInTheDocument();
});

test('click on forward arrrow', async () => {
  render(notifications);
  await waitFor(() => {
    const arrow = screen.getAllByTestId('tooltip');
    fireEvent.click(arrow[0]);
  });
});

test('it should show copy text and view option on clicking entity ', async () => {
  const { getByTestId, getByText } = render(notifications);
  await waitFor(() => {
    const entityMenu = screen.getAllByTestId('Menu');
    fireEvent.click(entityMenu[0]);

    const viewButton = screen.getAllByTestId('MenuItem');
    // view option
    expect(viewButton[0]).toBeInTheDocument();
    fireEvent.click(viewButton[0]);

    // copy text option
    expect(viewButton[1]).toBeInTheDocument();
    fireEvent.click(viewButton[1]);

    // after clicking on view it should show copy text option
    const copyText = getByTestId('copyToClipboard');
    fireEvent.click(copyText);

    // after view it should show Done button
    const doneButton = getByText('Done');
    fireEvent.click(doneButton);
  });
});

test('it should show filter checkboxes', async () => {
  render(notifications);
  await waitFor(() => {});
  const checkboxInput = screen.getAllByRole('checkbox');
  fireEvent.click(checkboxInput[0]);
});
