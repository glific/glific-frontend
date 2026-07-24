import { render, cleanup, fireEvent, act, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import UserEvent from '@testing-library/user-event';
import { BrowserRouter as Router } from 'react-router';

import { deleteOrganization, getAllOrganizations, setOrganizationReadyToDelete } from 'mocks/Organization';
import { setUserSession } from 'services/AuthService';
import * as Notification from 'common/notification';
import OrganizationList from './OrganizationList';

afterEach(cleanup);
const notificationSpy = vi.spyOn(Notification, 'setNotification');
const mocks = [
  ...getAllOrganizations,
  setOrganizationReadyToDelete,
  deleteOrganization,
  // Refetch fired after the delete flow completes.
  ...getAllOrganizations,
];
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

  await waitFor(() => {
    expect(screen.getByTestId('DeleteIcon')).toBeInTheDocument();
  });
  const deleteButton = screen.getByTestId('DeleteIcon');

  fireEvent.click(deleteButton);

  // Only the org in `READY_TO_DELETE` status (Foogle) exposes the delete action,
  // and the name must match for the confirm button to be enabled.
  const confirmationInput = screen.getByRole('textbox');
  await UserEvent.type(confirmationInput, 'Foogle');

  expect(confirmationInput).toBeInTheDocument();
  expect(confirmationInput).toHaveValue('Foogle');

  const confirmDeleteButton = screen.getByText('Confirm');
  expect(confirmDeleteButton).toBeInTheDocument();

  fireEvent.click(confirmDeleteButton);

  // The async delete flow sets the org to `ready_to_delete`, fires the delete
  // mutation, and reports that deletion has been initiated.
  await waitFor(() => {
    expect(notificationSpy).toHaveBeenCalledWith(
      'Organization deletion has been initiated. You will be notified once it is complete.'
    );
  });
});
