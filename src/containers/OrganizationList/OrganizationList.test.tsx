import { render, cleanup, fireEvent, act, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import UserEvent from '@testing-library/user-event';
import { BrowserRouter as Router } from 'react-router-dom';

import { getAllOrganizations } from 'mocks/Organization';
import { setUserSession } from 'services/AuthService';
import OrganizationList from './OrganizationList';

afterEach(cleanup);
const mocks = getAllOrganizations;
setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Admin'] }));

const props = { openExtensionModal: false, openCustomerModal: false };

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
  const nameLabel = await screen.findByText('Name');
  const statusLabel = await screen.findByText('Status');

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

  const extensionButton = screen.getAllByTestId('additionalButton')[0];

  const orgCustomerButton = screen.getAllByTestId('additionalButton')[1];

  expect(label).toBeInTheDocument();
  expect(extensionButton).toBeInTheDocument();
  expect(orgCustomerButton).toBeInTheDocument();
  fireEvent.click(extensionButton);
  fireEvent.click(orgCustomerButton);

  const deleteButton = screen.getByRole('button', { name: 'Delete' });
  expect(deleteButton).toBeInTheDocument();
  fireEvent.click(deleteButton);

  const confirmationInput = screen.getByRole('textbox');
  await UserEvent.type(confirmationInput, 'Test');

  expect(confirmationInput).toBeInTheDocument();
  expect(confirmationInput).toHaveValue('Test');

  const confirmDeleteButton = screen.getByText('Confirm');
  expect(confirmDeleteButton).toBeInTheDocument();

  fireEvent.click(confirmDeleteButton);
});
