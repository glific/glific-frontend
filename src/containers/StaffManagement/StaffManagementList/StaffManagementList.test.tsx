import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';

import { setUserSession } from 'services/AuthService';
import { StaffManagementList } from './StaffManagementList';
import { FILTER_USER_MOCK, USER_COUNT_MOCK } from '../StaffManagement.test.helper';
import { getOrganizationPhone } from 'mocks/Organization';
import axios from 'axios';

vi.mock('axios');
const mockedAxios = axios as any;

const mocks = [USER_COUNT_MOCK, FILTER_USER_MOCK, getOrganizationPhone];

mockedAxios.post.mockImplementation(() => Promise.resolve({ data: {} }));

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

  await waitFor(() => {
    const nameLabel = screen.getByText('Name');
    const phoneLabel = screen.getByText('Phone number');
    const assignedToLabel = screen.getByText('Assigned to');
    const actionLabel = screen.getByText('Actions');

    expect(nameLabel).toBeInTheDocument();
    expect(phoneLabel).toBeInTheDocument();
    expect(assignedToLabel).toBeInTheDocument();
    expect(actionLabel).toBeInTheDocument();
  });
});
