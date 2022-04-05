import { cleanup, render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import { setUserSession } from 'services/AuthService';
import { CONVERSATION_MOCKS } from 'mocks/Chat';

import { Chat } from './Chat';
import { MemoryRouter } from 'react-router';

const mocks: any = CONVERSATION_MOCKS;

setUserSession(JSON.stringify({ roles: ['Admin'], organization: { id: '1' } }));

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
    await waitFor(() => {});
    await waitFor(() => {});
  });
});
