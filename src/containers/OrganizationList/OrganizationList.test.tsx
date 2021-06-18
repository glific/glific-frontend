import { render, cleanup, fireEvent, act, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import UserEvent from '@testing-library/user-event';
import OrganizationList from './OrganizationList';
import { getAllOrganizations } from '../../mocks/Organization';
import { BrowserRouter as Router } from 'react-router-dom';
import { setUserSession } from '../../services/AuthService';

afterEach(cleanup);
const mocks = getAllOrganizations;
setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Admin'] }));

const list = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <OrganizationList />
    </Router>
  </MockedProvider>
);

test('Organization list renders correctly', async () => {
  render(list);

  expect(screen.getByText('Loading...')).toBeInTheDocument();
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  const label = await screen.findByText('Organizations');
  const nameLabel = await screen.findByText('NAME');
  const statusLabel = await screen.findByText('STATUS');

  expect(label).toBeInTheDocument();
  expect(nameLabel).toBeInTheDocument();
  expect(statusLabel).toBeInTheDocument();
});

test('Update status', async () => {
  render(list);

  expect(screen.getByText('Loading...')).toBeInTheDocument();

  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  const label = await screen.findByText('Organizations');

  expect(label).toBeInTheDocument();

  const deleteButton = screen.getByRole('button', { name: 'Delete' });
  expect(deleteButton).toBeInTheDocument();
  fireEvent.click(deleteButton);

  const confirmationInput = screen.getByRole('textbox');
  UserEvent.type(confirmationInput, 'Test');

  expect(confirmationInput).toBeInTheDocument();
  expect(confirmationInput).toHaveValue('Test');

  const confirmDeleteButton = screen.getByText('Confirm');
  expect(confirmDeleteButton).toBeInTheDocument();

  fireEvent.click(confirmDeleteButton);
});
