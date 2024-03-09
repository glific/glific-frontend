import { render, cleanup, act, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import { BrowserRouter as Router } from 'react-router-dom';

import { getAllOrganizations } from 'mocks/Organization';
import { setUserSession } from 'services/AuthService';
import { SuperAdminContactManagement } from './SuperAdminContactManagement';

afterEach(cleanup);
const mocks = getAllOrganizations;
setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Glific_admin'] }));

const list = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <SuperAdminContactManagement />
    </Router>
  </MockedProvider>
);

test('Super admin contact management list renders correctly', async () => {
  render(list);

  expect(screen.getByTestId('loading')).toBeInTheDocument();
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  const label = await screen.findByText('Contact management');
  const nameLabel = await screen.findByText('Name');
  const actionLabel = await screen.findByText('Actions');

  expect(label).toBeInTheDocument();
  expect(nameLabel).toBeInTheDocument();
  expect(actionLabel).toBeInTheDocument();
});
