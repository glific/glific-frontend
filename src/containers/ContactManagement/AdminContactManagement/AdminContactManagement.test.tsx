import { render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import { BrowserRouter as Router } from 'react-router-dom';

import { getAllOrganizations } from 'mocks/Organization';
import { setUserSession } from 'services/AuthService';
import { AdminContactManagement } from './AdminContactManagement';

const mocks = getAllOrganizations;

setUserSession(JSON.stringify({ roles: [{ label: 'Admin' }], organization: { id: '1' } }));

const contactManagement = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <AdminContactManagement />
    </Router>
  </MockedProvider>
);

test('Admin contact management form renders correctly', async () => {
  render(contactManagement);
  expect(screen.getByText('Unauthorized access')).toBeInTheDocument();
});
