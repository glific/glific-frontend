import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import { setUserSession } from 'services/AuthService';
import { CONVERSATION_MOCKS } from 'mocks/Chat';

import { Chat } from './Chat';
import { MemoryRouter } from 'react-router';

vi.mock('containers/Chat/ChatSubscription/ChatSubscription', () => ({
  default: () => <div>Chat subscription</div>,
  ChatSubscription: () => <div>Chat subscription</div>,
}));

const mocks: any = CONVERSATION_MOCKS;

setUserSession(JSON.stringify({ roles: ['Admin'], organization: { id: '1' } }));
let scrollIntoViewMock = vitest.fn();
window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

describe('<Chat />', () => {
  afterEach(cleanup);

  test('it should render <Chat /> component correctly', async () => {
    render(
      <MemoryRouter>
        <MockedProvider mocks={mocks} addTypename={false}>
          <Chat />
        </MockedProvider>
      </MemoryRouter>
    );

    // there is nothing to assert here just waiting for all the mock calls working
    await waitFor(() => {
      expect(screen.getByText('Chat subscription')).toBeInTheDocument();
    });
  });
});
