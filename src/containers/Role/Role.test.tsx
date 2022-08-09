import { MockedProvider } from '@apollo/client/testing';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Role } from './Role';
import {
  createRoleMutation,
  deleteRoleMutation,
  getRoleQuery,
  updateRoleMutation,
} from 'mocks/Role';

const mocks = [getRoleQuery, createRoleMutation, updateRoleMutation, deleteRoleMutation];
const flow = (match: any) => (
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter>
      <Role match={match} />
    </MemoryRouter>
  </MockedProvider>
);

it('should render Role form page', async () => {
  const wrapper = render(flow({ params: { id: '5' } }));
  await waitFor(() => {
    expect(wrapper.container).toBeInTheDocument();
  });
});

it('should have fields for name and description', async () => {
  const { getAllByTestId } = render(flow({ params: { id: '5' } }));
  await waitFor(() => {
    expect(getAllByTestId('inputLabel')[0]).toHaveTextContent('Label');
    expect(getAllByTestId('inputLabel')[1]).toHaveTextContent('Description');
  });
});
