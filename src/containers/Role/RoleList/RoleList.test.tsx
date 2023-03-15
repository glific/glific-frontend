import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';

import { setUserSession } from 'services/AuthService';
import { RoleList } from './RoleList';

import { countRolesQuery, filterRolesQuery } from 'mocks/Role';

const mocks = [countRolesQuery, filterRolesQuery];

const rolesList = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter>
      <RoleList />
    </MemoryRouter>
  </MockedProvider>
);

HTMLAnchorElement.prototype.click = vi.fn();

setUserSession(JSON.stringify({ roles: ['Admin'] }));

describe('<Role List />', () => {
  test('should render a list of roles', async () => {
    const { getByText } = render(rolesList);
    expect(getByText('Loading...')).toBeInTheDocument();
    await waitFor(() => {
      expect(getByText('Role Management')).toBeInTheDocument();
      expect(getByText('Admin')).toBeInTheDocument();
    });
  });
});
