import React from 'react';
import { render, wait } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import { ContactProfile } from './ContactProfile';
import { LOGGED_IN_USER_MOCK } from '../../../mocks/Contact';

const mocks = LOGGED_IN_USER_MOCK;

const defaultProps = {
  match: { params: { id: 1 } },
};



test('contact profile should render', async () => {
  const { getByTestId } = render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <ContactProfile {...defaultProps} />
    </MockedProvider>
  );
  await wait();
  await wait();

  expect(getByTestId('ContactProfile')).toBeInTheDocument();
});
