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

const props = { match: { params: {} }, openExtensionModal: false, openCustomerModal: false };

const list = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <OrganizationList {...props} />
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
  const isActiveLabel = await screen.findByText('IS ACTIVE');
  const actionLabel = await screen.findByText('ACTIONS');

  expect(label).toBeInTheDocument();
  expect(nameLabel).toBeInTheDocument();
  expect(isActiveLabel).toBeInTheDocument();
  expect(actionLabel).toBeInTheDocument();
});

test('Perform button actions on Org List', async () => {
  render(list);

  expect(screen.getByText('Loading...')).toBeInTheDocument();

  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  const label = await screen.findByText('Organizations');

  const extensionButton = screen.getAllByRole('button', {
    name: 'extension.svg',
  })[0];

  const approveButton = screen.getAllByRole('button', {
    name: 'Unblock.svg',
  })[0];
  const activateButton = screen.getAllByRole('button', {
    name: 'Remove.svg',
  })[0];

  const orgCustomerButton = screen.getAllByRole('button', { name: 'customer_details.svg' })[0];

  expect(label).toBeInTheDocument();
  expect(approveButton).toBeInTheDocument();
  expect(activateButton).toBeInTheDocument();
  expect(extensionButton).toBeInTheDocument();
  expect(orgCustomerButton).toBeInTheDocument();

  fireEvent.click(approveButton);
  fireEvent.click(activateButton);
  fireEvent.click(extensionButton);
  fireEvent.click(orgCustomerButton);

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
