import { MockedProvider } from '@apollo/client/testing';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import { Role } from './Role';
import {
  createRoleMutation,
  deleteRoleMutation,
  getRoleQuery,
  updateRoleMutation,
} from 'mocks/Role';

const mocks = [getRoleQuery, createRoleMutation, updateRoleMutation, deleteRoleMutation];

vi.mock('react-router-dom', () => ({
  ...(vi.requireActual('react-router-dom') as {}),
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
  const { getAllByTestId } = render(role);
  await waitFor(() => {
    expect(getAllByTestId('inputLabel')[0]).toHaveTextContent('Label');
    expect(getAllByTestId('inputLabel')[1]).toHaveTextContent('Description');
  });
});
