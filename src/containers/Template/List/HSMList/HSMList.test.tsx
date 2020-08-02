import React from 'react';
import { render, wait, cleanup } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { HSMList } from './HSMList';
import { within } from '@testing-library/dom';
import { TEMPLATE_MOCKS } from '../Template.test.helper';

afterEach(cleanup);
const mocks = TEMPLATE_MOCKS;

const template = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <HSMList />
    </Router>
  </MockedProvider>
);

test('HSMList is rendered correctly', async () => {
  const { getByText } = render(template);

  await wait();
  expect(getByText('Templates')).toBeInTheDocument();
});
