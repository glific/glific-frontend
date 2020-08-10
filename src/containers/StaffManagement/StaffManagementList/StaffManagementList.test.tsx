import React from 'react';
import { render, wait } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { StaffManagementList } from './StaffManagementList';
import { STAFF_MANAGEMENT_MOCKS } from '../StaffManagement.test.helper';

const mocks = STAFF_MANAGEMENT_MOCKS;

const staffManagement = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <StaffManagementList />
    </Router>
  </MockedProvider>
);

test('StaffManagementList is rendered correctly', async () => {
  const { getByText } = render(staffManagement);

  await wait();
  expect(getByText('Staff Management')).toBeInTheDocument();
});
