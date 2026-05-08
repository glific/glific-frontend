import { MockedProvider } from '@apollo/client/testing';
import { cleanup, render, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router';

import { SPEED_SEND_LIST } from 'mocks/Template';
import { setUserSession } from 'services/AuthService';
import { SpeedSendList } from './SpeedSendList';

afterEach(cleanup);
const mocks = [...SPEED_SEND_LIST, ...SPEED_SEND_LIST];

const speedSend = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <SpeedSendList />
    </Router>
  </MockedProvider>
);

setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Admin'] }));

// Tests are skipped as the feature is marked for deprecation and
// the tests are brittle.
describe.skip('SpeedSendList', () => {
  test('has proper headers', async () => {
    const { getByText, container } = render(speedSend);

    await waitFor(() => {
      expect(getByText('Speed sends')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(getByText('Title')).toBeInTheDocument();
      expect(getByText('Body')).toBeInTheDocument();
      expect(getByText('Actions')).toBeInTheDocument();
    });
  });
});
