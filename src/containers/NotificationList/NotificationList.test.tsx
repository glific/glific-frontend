import { render, waitFor, fireEvent, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';

import {
  getUnFitleredNotificationCountQuery,
  getFilteredNotificationsQuery,
  getNotificationsQuery,
  getCountWithFilter,
  getCountWithEmptyFilter,
  markAllNotificationAsRead,
  getInfoNotificationsQuery,
} from 'mocks/Notifications';
import { setUserSession } from 'services/AuthService';
import { NotificationList } from './NotificationList';

setUserSession(JSON.stringify({ roles: ['Admin'] }));

const mocks: any = [
  getUnFitleredNotificationCountQuery,
  getNotificationsQuery,
  getUnFitleredNotificationCountQuery,
  getCountWithFilter,
  getCountWithEmptyFilter,
  markAllNotificationAsRead,
  getFilteredNotificationsQuery,
  getInfoNotificationsQuery,
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

  const time = await screen.findByText('Timestamp');
  const category = await screen.findByText('Category');
  const severity = await screen.findByText('Severity');
  const entity = await screen.findByText('Entity');
  const message = await screen.findByText('Message');

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
    const entityMenu = screen.getByTestId('NotificationRowMenu');
    expect(entityMenu).toBeInTheDocument();

    fireEvent.click(entityMenu);
    const viewButton = screen.getAllByTestId('MenuItem');

    // copy text option
    expect(viewButton[0]).toBeInTheDocument();
    fireEvent.click(viewButton[0]);

    // view option
    expect(viewButton[1]).toBeInTheDocument();
    fireEvent.click(viewButton[1]);
  });

  await waitFor(() => {
    expect(getByTestId('copyToClipboard')).toBeInTheDocument();
    // after clicking on view it should show copy text option
    const copyText = getByTestId('copyToClipboard');
    fireEvent.click(copyText);
    // after view it should show Done button
    const doneButton = getByText('Done');
    fireEvent.click(doneButton);
  });
});

test('it should show filter radio button', async () => {
  render(notifications);

  await waitFor(() => {
    const checkboxInput = screen.getAllByTestId('radio');
    fireEvent.click(checkboxInput[0]);
  });
});

test('it should have Info, Warning and critical checkbox', async () => {
  render(notifications);

  await waitFor(() => {
    const checkboxInput = screen.getAllByTestId('radio');
    expect(checkboxInput[0]).toHaveTextContent('Critical');
    expect(checkboxInput[1]).toHaveTextContent('Warning');
    expect(checkboxInput[2]).toHaveTextContent('Info');
    expect(checkboxInput[3]).toHaveTextContent('All');
  });
});
