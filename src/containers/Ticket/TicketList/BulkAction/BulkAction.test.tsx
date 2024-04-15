import { fireEvent, render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter as Router } from 'react-router-dom';

import { setUserSession } from 'services/AuthService';
import { BulkAction } from './BulkAction';
import { getAllOrganizations } from 'mocks/Organization';
import { getAllFlowLabelsQuery } from 'mocks/Flow';
import * as Notification from 'common/notification';
import { bulkActionQuery } from 'mocks/Ticket';

const mocks = [...getAllOrganizations, getAllFlowLabelsQuery, bulkActionQuery];
setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Admin'] }));

const setShowBulkCloseMock = vi.fn();

const bulkUpdate = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <BulkAction setShowBulkClose={setShowBulkCloseMock} />
    </Router>
  </MockedProvider>
);

it('Renders Export ticket component successfully', async () => {
  const { getByText } = render(bulkUpdate);

  await waitFor(() => {
    expect(getByText('All tickets will be closed for this topic')).toBeInTheDocument();
  });
});

it('Bulk updates successfully', async () => {
  const notificationSpy = vi.spyOn(Notification, 'setNotification');
  const { getByText, getByTestId } = render(bulkUpdate);

  await waitFor(() => {
    expect(getByText('All tickets will be closed for this topic')).toBeInTheDocument();
  });

  const autocomplete = getByTestId('autocomplete-element');
  autocomplete.focus();
  fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });
  fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });
  fireEvent.keyDown(autocomplete, { key: 'Enter' });

  fireEvent.click(getByTestId('ok-button'));

  await waitFor(() => {
    expect(notificationSpy).toHaveBeenCalledWith('Tickets closed successfully');
  });
});

it('Closes the dialog box on clicking cancel ', async () => {
  const { getByText, getByTestId } = render(bulkUpdate);

  fireEvent.click(getByTestId('cancel-button'));

  await waitFor(() => {
    expect(setShowBulkCloseMock).toHaveBeenCalled();
  });
});
