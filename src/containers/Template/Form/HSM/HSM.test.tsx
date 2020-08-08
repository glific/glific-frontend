import React from 'react';
import { render, wait, within, fireEvent, cleanup } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import { HSM } from './HSM';
import { TEMPLATE_MOCKS } from '../../Template.test.helper';

afterEach(cleanup);
const mocks = TEMPLATE_MOCKS;

test('HSM form is loaded correctly in edit mode', async () => {
  const { getByText } = render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <HSM match={{ params: { id: 1 } }} />
    </MockedProvider>
  );
  await wait();
  expect(getByText('Edit HSM Template')).toBeInTheDocument();
});

test('check for validations for the HSM form', async () => {
  const { getByText, container } = render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <HSM match={{ params: { id: null } }} />
    </MockedProvider>
  );
  await wait();
  expect(getByText('Add a new HSM Template')).toBeInTheDocument();

  const { queryByText } = within(container.querySelector('form'));
  const button = queryByText('Save');
  fireEvent.click(button);
  await wait();

  // we should have 2 errors
  expect(queryByText('Message title required')).toBeInTheDocument();
  expect(queryByText('Message body required')).toBeInTheDocument();

  fireEvent.change(container.querySelector('input[name="label"]'), {
    target: {
      value: 'We are not allowing a really long title, and we should trigger validation for this.',
    },
  });

  // we should still have 2 errors
  expect(queryByText('Message title required')).toBeInTheDocument();
  expect(queryByText('Message body required')).toBeInTheDocument();
});
