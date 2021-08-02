import { render, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';

import { getWebhookLogsQuery, getWebhookLogsCountQuery } from 'mocks/WebhookLogs';
import { setUserSession } from 'services/AuthService';
import { WebhookLogsList } from './WebhookLogsList';

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

const mocks = [getWebhookLogsQuery, getWebhookLogsQuery, getWebhookLogsCountQuery];

const webhookLogs = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <WebhookLogsList />
    </Router>
  </MockedProvider>
);

test('Webhook logs are loaded', async () => {
  const { getByText } = render(webhookLogs);

  // before data loaded
  await waitFor(() => {
    expect(getByText('Webhook Logs')).toBeInTheDocument();
  });

  // check if the URL is loaded
  await waitFor(() => {
    expect(getByText('"glific.com"')).toBeInTheDocument();
  });
});

test('Show data on popup', async () => {
  const { getAllByTestId, getAllByText, getByText, getByTestId } = render(webhookLogs);

  // check if the URL is loaded
  await waitFor(() => {
    fireEvent.click(getByText('"glific.com"'));
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
  const { getAllByTestId, getByText } = render(webhookLogs);

  // check if the URL is loaded
  await waitFor(() => {
    fireEvent.click(getByText('"glific.com"'));
    fireEvent.click(getAllByTestId('MenuItem')[0]);
  });

  // there is nothing to assert here
});
