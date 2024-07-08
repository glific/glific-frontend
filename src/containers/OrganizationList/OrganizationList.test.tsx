import { render, cleanup, fireEvent, act, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import UserEvent from '@testing-library/user-event';
import { BrowserRouter as Router } from 'react-router-dom';

import { deleteOrganization, getAllOrganizations } from 'mocks/Organization';
import { setUserSession } from 'services/AuthService';
import OrganizationList from './OrganizationList';

afterEach(cleanup);
const mocks = [...getAllOrganizations, deleteOrganization];
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

  expect(screen.getByTestId('loading')).toBeInTheDocument();
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

  expect(screen.getByTestId('loading')).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText('Organizations')).toBeInTheDocument();
    expect(screen.getAllByTestId('additionalButton')).toBeDefined();
  });

  const extensionButton = screen.getAllByTestId('additionalButton')[0];

  const orgCustomerButton = screen.getAllByTestId('additionalButton')[1];

  expect(extensionButton).toBeInTheDocument();
  expect(orgCustomerButton).toBeInTheDocument();
  fireEvent.click(extensionButton);
  fireEvent.click(orgCustomerButton);
  const moreButton = screen.getAllByTestId('MoreIcon');
  fireEvent.click(moreButton[0]);
  await waitFor(() => {
    expect(screen.getByTestId('DeleteIcon')).toBeInTheDocument();
  });
  const deleteButton = screen.getByTestId('DeleteIcon');

  fireEvent.click(deleteButton);

  const confirmationInput = screen.getByRole('textbox');
  await UserEvent.type(confirmationInput, 'Test');

  expect(confirmationInput).toBeInTheDocument();
  expect(confirmationInput).toHaveValue('Test');

  const confirmDeleteButton = screen.getByText('Confirm');
  expect(confirmDeleteButton).toBeInTheDocument();

  fireEvent.click(confirmDeleteButton);

  await waitFor(() => {});
});
