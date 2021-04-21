import React from 'react';
import { render, waitFor, cleanup } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { SpeedSendList } from './SpeedSendList';
import { within } from '@testing-library/dom';
import { TEMPLATE_MOCKS } from '../../Template.test.helper';
import { setUserSession } from '../../../../services/AuthService';

afterEach(cleanup);
const mocks = TEMPLATE_MOCKS;

const speedSend = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <SpeedSendList />
    </Router>
  </MockedProvider>
);

test('SpeedSendList has proper headers', async () => {
  const { getByText, container } = render(speedSend);

  setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Admin'] }));

  await waitFor(() => {
    expect(getByText('Speed sends')).toBeInTheDocument();
  });

  await waitFor(() => {
    expect(getByText('LABEL')).toBeInTheDocument();
    expect(getByText('BODY')).toBeInTheDocument();
    expect(getByText('ACTIONS')).toBeInTheDocument();
  });
});
