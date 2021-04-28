import { render, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { NotificationList } from './NotificationList';
import { getNotificationCountQuery, getNotificationsQuery } from '../../mocks/Notifications';
import { setUserSession } from '../../services/AuthService';

setUserSession(JSON.stringify({ roles: ['Admin'] }));

beforeEach(() => {
  Object.assign(navigator, {
    clipboard: {
      writeText: () => {},
    },
  });
  jest
    .spyOn(navigator.clipboard, 'writeText')
    .mockImplementation(() => Promise.resolve({ data: {} }));
});

const mocks = [getNotificationCountQuery, getNotificationsQuery, getNotificationsQuery];

const notifications = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <NotificationList />
    </Router>
  </MockedProvider>
);

test('Notifications are loaded', async () => {
  const { getByText } = render(notifications);

  // before data loaded
  await waitFor(() => {
    expect(getByText('Notifications')).toBeInTheDocument();
  });

  // check if the URL is loaded
  await waitFor(() => {
    expect(
      getByText('Cannot send session message to contact, invalid bsp status.')
    ).toBeInTheDocument();
  });
});

test('Show data on popup', async () => {
  const { getAllByTestId, getAllByText, getByText, getByTestId } = render(notifications);

  // check if the entity is loaded
  await waitFor(() => {
    fireEvent.click(getByText('{"status":"valid","phone"...'));
    fireEvent.click(getAllByTestId('MenuItem')[1]);
  });

  await waitFor(() => {
    expect(getAllByText('Copy text')[0]).toBeInTheDocument();
  });
  // click on copy button
  fireEvent.click(getAllByText('Copy text')[0]);
  fireEvent.click(getByTestId('copyToClipboard'));
  // click on done button to close the popup
  fireEvent.click(getByText('Done'));
});

test('copy data to clipboard', async () => {
  const { getAllByTestId, getByText } = render(notifications);

  // check if the entity is loaded
  await waitFor(() => {
    fireEvent.click(getByText('{"status":"valid","phone"...'));
    fireEvent.click(getAllByTestId('MenuItem')[0]);
  });

  // there is nothing to assert here
});
