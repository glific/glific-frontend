import React from 'react';
import { render, waitForElement, fireEvent } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import { StaffManagement } from './StaffManagement';
import { STAFF_MANAGEMENT_MOCKS } from './StaffManagement.test.helper';

const mocks = STAFF_MANAGEMENT_MOCKS;

const staffManagement = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <StaffManagement match={{ params: { id: 1 } }} />
  </MockedProvider>
);

test('should load the staff user edit form', async () => {
  const { getByText, findByTestId } = render(staffManagement);

  // loading is show initially
  expect(getByText('Loading...')).toBeInTheDocument();

  const formLayout = await findByTestId('formLayout');
  expect(formLayout).toHaveTextContent('Username');
});

test('should display help popup', async () => {
  const { getByText } = render(staffManagement);

  // loading is show initially
  expect(getByText('Loading...')).toBeInTheDocument();

  await waitForElement(() => getByText('help?'));
  const help = getByText('help?');
  expect(help).toBeInTheDocument();
  fireEvent.click(help);

  const header = getByText('User roles');
  expect(header).toBeInTheDocument();
});
