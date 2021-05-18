import { render, waitFor, fireEvent, screen } from '@testing-library/react';
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

const mocks = [getNotificationCountQuery, getNotificationsQuery];

const notifications = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <NotificationList />
    </Router>
  </MockedProvider>
);

test('It should load notifications', async () => {
  render(notifications);
  const time = await screen.findByText('TIME');
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
  const { getAllByTestId } = render(notifications);
  await waitFor(() => {
    const arrow = screen.getAllByTestId('tooltip');
    fireEvent.click(arrow[0]);
  });
});

test('it should show copy text and view option on clicking entity ', async () => {
  const { getAllByTestId, getByTestId, getByText } = render(notifications);
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
