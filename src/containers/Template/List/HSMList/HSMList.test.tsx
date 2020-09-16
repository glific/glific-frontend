import React from 'react';
import { render, wait } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { HSMList } from './HSMList';
import { TEMPLATE_MOCKS } from '../../Template.test.helper';

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
  await wait();
});
