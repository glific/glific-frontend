import { render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import { BrowserRouter as Router } from 'react-router-dom';

import { getAllOrganizations } from 'mocks/Organization';
import { setUserSession } from 'services/AuthService';
import ContactManagement from './ContactManagement';

const mocks = getAllOrganizations;

const contactManagement = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <ContactManagement />
    </Router>
  </MockedProvider>
);

setUserSession(JSON.stringify({ roles: [{ label: 'Staff' }], organization: { id: '1' } }));

test('Show unauthorized access for staff user', async () => {
  render(contactManagement);
  expect(screen.getByText('Unauthorized access')).toBeInTheDocument();
});
