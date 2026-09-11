import { render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import { GET_CONTACT_WEB_PRESENCE } from 'graphql/queries/Contact';
import { WebPresence } from './WebPresence';

const presenceMock = (isWebOnline: boolean) => ({
  request: { query: GET_CONTACT_WEB_PRESENCE, variables: { id: '2' } },
  result: { data: { contact: { contact: { id: '2', isWebOnline } } } },
});

const renderPresence = (mock: any) =>
  render(
    <MockedProvider mocks={[mock]} addTypename={false}>
      <WebPresence entityId="2" />
    </MockedProvider>
  );

test('shows the contact as online while their widget is connected', async () => {
  renderPresence(presenceMock(true));

  await waitFor(() => expect(screen.getByTestId('webPresence')).toHaveTextContent('Online'));
});

// The dot reads as a suffix to the word, not a bullet in front of it — it sits after the label.
test('puts the status dot after the label', async () => {
  const { container } = renderPresence(presenceMock(true));

  await waitFor(() => expect(screen.getByTestId('webPresence')).toHaveTextContent('Online'));

  const presence = screen.getByTestId('webPresence');
  const dot = container.querySelector('span[aria-hidden="true"]');

  // lastChild, not lastElementChild: the label is a text node, so the element-only accessor would
  // find the dot whichever side of it the label sits on.
  expect(presence.lastChild).toBe(dot);
});

test('shows the contact as offline once the socket is gone', async () => {
  renderPresence(presenceMock(false));

  await waitFor(() => expect(screen.getByTestId('webPresence')).toHaveTextContent('Offline'));
});

// Presence is best-effort: a failed or not-yet-answered poll must read as offline rather than
// leaving staff looking at a stale "Online".
test('reads as offline before the first response arrives', () => {
  renderPresence(presenceMock(true));

  expect(screen.getByTestId('webPresence')).toHaveTextContent('Offline');
});
