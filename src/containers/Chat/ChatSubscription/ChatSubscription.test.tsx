import React from 'react';
import { cleanup, render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import { ChatSubscription } from './ChatSubscription';
import { setUserSession } from '../../../services/AuthService';
import { CONVERSATION_MOCKS } from '../../../mocks/Chat';

const mocks: any = CONVERSATION_MOCKS;

setUserSession(JSON.stringify({ roles: ['Admin'], organization: { id: '1' } }));

describe('<ChatSubscription />', () => {
  afterEach(cleanup);

  test('it should render <ChatSubscription /> component correctly', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ChatSubscription setDataLoaded={jest.fn()} setLoading={jest.fn()} />
      </MockedProvider>
    );

    // there is nothing to assert here just waiting for all the mock calls working
    await waitFor(() => {});
    await waitFor(() => {});
  });
});
