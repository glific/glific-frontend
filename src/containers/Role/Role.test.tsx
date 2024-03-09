import { MockedProvider } from '@apollo/client/testing';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import { Role } from './Role';
import {
  createRoleMutation,
  deleteRoleMutation,
  getRoleQuery,
  updateRoleMutation,
} from 'mocks/Role';
import { getRoleNamesMock } from 'containers/StaffManagement/StaffManagement.test.helper';
import { getOrganizationLanguagesQuery } from 'mocks/Organization';

const mocks = [
  getRoleNamesMock,
  getRoleQuery,
  createRoleMutation,
  getOrganizationLanguagesQuery,
  updateRoleMutation,
  deleteRoleMutation,
];

vi.mock('react-router-dom', async () => ({
  ...((await vi.importActual<any>('react-router-dom')) as {}),
  useParams: () => ({ id: '5' }),
}));

const role = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter>
      <Role />
    </MemoryRouter>
  </MockedProvider>
);

it('should render Role form page', async () => {
  const wrapper = render(role);
  await waitFor(() => {
    expect(wrapper.container).toBeInTheDocument();
  });
});

it('should have fields for name and description', async () => {
  render(role);

  await waitFor(() => {
    const loadingText = screen.queryByText('Loading...');
    expect(loadingText).not.toBeInTheDocument();
  });

  const Label = screen.getByText('Label');
  expect(Label).toBeInTheDocument();

  const Description = screen.getByText('Description');
  expect(Description).toBeInTheDocument();
});
