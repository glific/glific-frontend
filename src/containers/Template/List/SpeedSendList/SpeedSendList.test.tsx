import React from 'react';
import { render, wait, cleanup } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { SpeedSendList } from './SpeedSendList';
import { within } from '@testing-library/dom';
import { TEMPLATE_MOCKS } from '../../Template.test.helper';

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

  await wait();

  expect(getByText('Speed sends')).toBeInTheDocument();

  const { getByText: getByTextTableheader } = within(container.querySelector('thead'));
  expect(getByTextTableheader('LABEL')).toBeInTheDocument();
  expect(getByTextTableheader('BODY')).toBeInTheDocument();
  expect(getByTextTableheader('ACTIONS')).toBeInTheDocument();
  await wait();
});
