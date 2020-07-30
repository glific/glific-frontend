import React from 'react';
import { render, wait, cleanup } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { SpeedSendList } from './SpeedSendList';
import { within } from '@testing-library/dom';
import { TEMPLATE_MOCKS } from './SpeedSendList.test.helper';

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
  const { container } = render(speedSend);

  await wait();
  const { getByText } = within(container.querySelector('thead'));
  expect(getByText('LABEL')).toBeInTheDocument();
  expect(getByText('BODY')).toBeInTheDocument();
  expect(getByText('ACTIONS')).toBeInTheDocument();
});

test('edit Button contains a route to edit page', async () => {
  const { container } = render(speedSend);
  await wait();
  expect(container.querySelector('tbody tr a').getAttribute('href')).toBe('/speed-send/87/edit');
});
