import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import { Trigger } from './Trigger';
import { getTriggerQuery } from '../../mocks/Trigger';

const mocks = [getTriggerQuery];

const wrapper = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Trigger match={{ params: { id: 1 } }} />
  </MockedProvider>
);

test('should load trigger edit form', async () => {
  const { getByText, getByTestId } = render(wrapper);

  // loading is show initially
  expect(getByText('Loading...')).toBeInTheDocument();
  await waitFor(() => {
    const formLayout = getByTestId('formLayout');
    expect(formLayout).toHaveTextContent('Keywords');
  });
});
