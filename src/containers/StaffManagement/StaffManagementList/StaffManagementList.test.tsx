import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { StaffManagementList } from './StaffManagementList';
import { FILTER_USER_MOCK, USER_COUNT_MOCK } from '../StaffManagement.test.helper';
import { setUserSession } from '../../../services/AuthService';

const mocks = [USER_COUNT_MOCK, FILTER_USER_MOCK];

const staffManagement = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <StaffManagementList />
    </Router>
  </MockedProvider>
);

test('StaffManagementList is rendered correctly', async () => {
  setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Manager'] }));
  render(staffManagement);

  await waitFor(async () => await new Promise((resolve) => setTimeout(resolve, 0)));
  const nameLabel = screen.getByText('NAME');
  const phoneLabel = screen.getByText('PHONE NO');
  const assignedToLabel = screen.getByText('ASSIGNED TO');
  const actionLabel = screen.getByText('ACTIONS');

  expect(nameLabel).toBeInTheDocument();
  expect(phoneLabel).toBeInTheDocument();
  expect(assignedToLabel).toBeInTheDocument();
  expect(actionLabel).toBeInTheDocument();
});
