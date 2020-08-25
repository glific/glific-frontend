import React from 'react';
import { render, wait } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import { StaffManagement } from './StaffManagement';
import { STAFF_MANAGEMENT_MOCKS } from './StaffManagement.test.helper';

const mocks = STAFF_MANAGEMENT_MOCKS;

test('should load the staff user edit form', async () => {
  const { getByText } = render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <StaffManagement match={{ params: { id: 1 } }} />
    </MockedProvider>
  );

  // loading is show initially
  expect(getByText('Loading...')).toBeInTheDocument();

  await wait();
  expect(getByText('Edit User')).toBeInTheDocument();
});
