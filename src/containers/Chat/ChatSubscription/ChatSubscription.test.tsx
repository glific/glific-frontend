import React from 'react';
import { cleanup, render, screen, waitFor, act } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { fireEvent } from '@testing-library/dom';

import { ChatSubscription } from './ChatSubscription';
import { setUserSession } from '../../../services/AuthService';
import { CONVERSATION_MOCKS } from '../../../mocks/Chat';

const mocks: any = CONVERSATION_MOCKS;

setUserSession(JSON.stringify({ roles: ['Admin'] }));

describe('<ChatSubscription />', () => {
  afterEach(cleanup);

  test('it should render <ErrorHandler /> component correctly', async () => {
    const { getByText } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ChatSubscription setDataLoaded={jest.fn()} setLoading={jest.fn()} />
      </MockedProvider>
    );

    await waitFor(() => {});
  });
});
