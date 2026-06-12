import { render, waitFor, fireEvent, screen, cleanup } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router';
import { MockedProvider } from '@apollo/client/testing';

import {
  getUnFitleredNotificationCountQuery,
  getFilteredNotificationsQuery,
  getNotificationsQuery,
  getCountWithFilter,
  getCountWithEmptyFilter,
  markAllNotificationAsRead,
  getInfoNotificationsQuery,
  getStatus,
  getStatusWithError,
} from 'mocks/Notifications';
import { setUserSession } from 'services/AuthService';
import { NotificationList } from './NotificationList';
import * as Notification from 'common/notification';

setUserSession(JSON.stringify({ roles: ['Admin'] }));

afterEach(cleanup);
const mocks: any = [
  getUnFitleredNotificationCountQuery,
  getNotificationsQuery,
  getUnFitleredNotificationCountQuery,
  getUnFitleredNotificationCountQuery,
  getCountWithFilter,
  getCountWithEmptyFilter,
  markAllNotificationAsRead,
  getFilteredNotificationsQuery,
  getInfoNotificationsQuery({ severity: '' }),
  getInfoNotificationsQuery({ severity: '' }),
  getInfoNotificationsQuery({ severity: 'Critical' }),
  getInfoNotificationsQuery({ severity: '' }),
  getInfoNotificationsQuery(),
];

const notifications = (mock?: any) => {
  let MOCKS = mocks;
  if (mock) {
    MOCKS = [...MOCKS, mock];
  }
  return (
    <MockedProvider mocks={MOCKS} addTypename={false}>
      <Router>
        <NotificationList />
      </Router>
    </MockedProvider>
  );
};

window.open = vi.fn();

test('It should load notifications', async () => {
  render(notifications());

  await waitFor(() => {
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  await waitFor(() => {
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  await waitFor(() => {
    const time = screen.getByText('Timestamp');
    const category = screen.getByText('Category');
    const severity = screen.getByText('Severity');
    const entity = screen.getByText('Entity');
    const message = screen.getAllByText('Message');
    expect(time).toBeInTheDocument();
    expect(category).toBeInTheDocument();
    expect(severity).toBeInTheDocument();
    expect(entity).toBeInTheDocument();
    expect(message).toHaveLength(2);
  });
});

test('click on forward arrrow', async () => {
  render(notifications(getStatus));

  await waitFor(() => {
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  await waitFor(() => {
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  const arrowButtons = screen.getAllByTestId('ArrowForwardIcon');

  arrowButtons.forEach(async (button) => {
    fireEvent.click(button);

    await waitFor(() => {
      expect(window.open).toHaveBeenCalled();
    });
  });
});

test('it should show copy text and view option on clicking entity ', async () => {
  const { getByTestId, getByText } = render(notifications());
  await waitFor(() => {
    const entityMenu = screen.getAllByTestId('NotificationRowMenu');
    expect(entityMenu[0]).toBeInTheDocument();

    fireEvent.click(entityMenu[0]);
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
  render(notifications());

  await waitFor(() => {
    const checkboxInput = screen.getAllByTestId('radio');
    fireEvent.click(checkboxInput[0]);
  });
});

test('it should have Info, Warning and critical checkbox', async () => {
  render(notifications());

  await waitFor(() => {
    const checkboxInput = screen.getAllByTestId('radio');
    expect(checkboxInput[0]).toHaveTextContent('All');
    expect(checkboxInput[1]).toHaveTextContent('Critical');
    expect(checkboxInput[2]).toHaveTextContent('Warning');
    expect(checkboxInput[3]).toHaveTextContent('Info');
  });
});

test('it should show "Contact import is in progress" message', async () => {
  const notificationSpy = vi.spyOn(Notification, 'setNotification');
  render(notifications(getStatusWithError));

  await waitFor(() => {
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  await waitFor(() => {
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  const arrowButtons = screen.getAllByTestId('ArrowForwardIcon');

  arrowButtons.forEach(async (button) => {
    fireEvent.click(button);

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalledWith();
    });
  });
});

test('it should surface multi-phone failover notifications and link to the group', async () => {
  render(notifications(getStatus));

  // Phase 4 warning failover notification renders with its message body
  await waitFor(() => {
    expect(
      screen.getByText(
        'Primary phone 919999999999 for group Maytapi Test Group is unavailable; switched to phone 918888888888.'
      )
    ).toBeInTheDocument();
  });

  // Phase 4 critical "no active phones" notification renders
  expect(screen.getByText('No active managed phones available for group Maytapi Test Group.')).toBeInTheDocument();

  // both surface under the "WA Group" category and show both severities
  expect(screen.getAllByText('WA Group').length).toBeGreaterThanOrEqual(2);
  expect(screen.getAllByText('Warning').length).toBeGreaterThanOrEqual(1);
  expect(screen.getAllByText('Critical').length).toBeGreaterThanOrEqual(1);

  // the group label (entity.label) is surfaced in the Entity column
  expect(screen.getAllByText(/Maytapi Test Group/).length).toBeGreaterThanOrEqual(1);

  // clicking the row action routes to the group's chat page (/group/chat/:groupId)
  const arrowButtons = screen.getAllByTestId('ArrowForwardIcon');
  arrowButtons.forEach((button) => fireEvent.click(button));

  await waitFor(() => {
    expect(window.open).toHaveBeenCalledWith('/group/chat/4', '_blank', 'noopener,noreferrer');
  });
});
