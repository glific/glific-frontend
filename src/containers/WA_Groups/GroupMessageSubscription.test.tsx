import { cleanup, render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { setUserSession } from 'services/AuthService';
import { GroupMessageSubscription } from './GroupMessageSubscription';
import { GROUP_CONVERSATION_MOCKS } from 'mocks/Groups';

const mocks: any = GROUP_CONVERSATION_MOCKS;

setUserSession(JSON.stringify({ roles: ['Admin'], organization: { id: '1' } }));

const GroupMessageParams = {
  setDataLoaded: vi.fn(),
  setLoading: vi.fn(),
};

describe('<GroupMessageSubscription />', () => {
  afterEach(cleanup);

  test('should render <GroupMessageSubscription /> component correctly', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <GroupMessageSubscription {...GroupMessageParams} />
      </MockedProvider>
    );

    // there is nothing to assert here just waiting for all the mock calls working
    await waitFor(() => {});
    await waitFor(() => {});
  });
});

describe('<GroupMessageSubscription />', () => {
  test('should render <GroupMessageSubscription /> component correctly', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <GroupMessageSubscription {...GroupMessageParams} />
      </MockedProvider>
    );

    // there is nothing to assert here just waiting for all the mock calls working
    await waitFor(() => {});
    await waitFor(() => {});
  });
});
