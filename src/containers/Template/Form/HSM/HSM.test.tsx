import React from 'react';
import { render, wait } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import { HSM } from './HSM';
import { TEMPLATE_MOCKS } from '../../Template.test.helper';

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
