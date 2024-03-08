import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter as Router } from 'react-router-dom';
import { StaffManagement } from './StaffManagement';
import {
  STAFF_MANAGEMENT_MOCKS,
  STAFF_MANAGEMENT_MOCKS_WITH_EMPTY_ROLES,
} from './StaffManagement.test.helper';
import * as Notification from 'common/notification';
import * as Utils from 'common/utils';

vi.mock('react-router-dom', async (importOriginal) => {
  const mod = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...mod,
    useParams: () => ({
      id: '1',
    }),
  };
});

const mocks = STAFF_MANAGEMENT_MOCKS;

const staffManagement = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <StaffManagement />
    </Router>
  </MockedProvider>
);

test('should load the staff user edit form', async () => {
  render(staffManagement);

  await waitFor(() => {
    const submitButton = screen.getByRole('button', { name: 'Save' });
    expect(submitButton).toBeInTheDocument();

    fireEvent.click(submitButton);
  });

  await waitFor(() => {});
});

test('it should have a help link', async () => {
  render(staffManagement);

  // loading is show initially
  expect(screen.getByText('Loading...')).toBeInTheDocument();
  await waitFor(() => {
    const helpButton = screen.getByTestId('helpButton');
    fireEvent.click(helpButton);
  });

  expect(screen.getByText('User roles')).toBeInTheDocument();

  const closeButton = screen.getByRole('button', { name: 'Close' });
  expect(closeButton).toBeInTheDocument();

  fireEvent.click(closeButton);
  await waitFor(() => {});
});

test('it should load with the initial values', async () => {
  render(staffManagement);
  await waitFor(() => {
    expect(screen.getByPlaceholderText('Username')).toHaveValue('Staff');
    expect(screen.getByPlaceholderText('Phone Number')).toHaveValue('919999988888');
  });
});

test('change the role from staff to Admin', async () => {
  const notificationSpy = vi.spyOn(Notification, 'setNotification');
  render(staffManagement);
  await waitFor(() => {
    expect(screen.getByPlaceholderText('Username')).toHaveValue('Staff');
    expect(screen.getByPlaceholderText('Phone Number')).toHaveValue('919999988888');
  });

  await waitFor(() => {
    expect(screen.getAllByTestId('AutocompleteInput')[0].querySelector('input')).toHaveValue(
      'Staff'
    );
  });

  const [roles] = screen.getAllByTestId('autocomplete-element');
  roles.focus();
  fireEvent.keyDown(roles, { key: 'ArrowDown' });
  fireEvent.keyDown(roles, { key: 'ArrowDown' });
  fireEvent.keyDown(roles, { key: 'Enter' });

  fireEvent.click(screen.getByTestId('submitActionButton'));

  await waitFor(() => {
    expect(notificationSpy).toHaveBeenCalled();
  });
});

test('can select multiple roles if dynamic roles are enabled', async () => {
  const notificationSpy = vi.spyOn(Notification, 'setNotification');
  const utilSpy = vi.spyOn(Utils, 'organizationHasDynamicRole');
  utilSpy.mockImplementation(() => true);

  render(staffManagement);

  await waitFor(() => {
    expect(screen.getByPlaceholderText('Username')).toHaveValue('Staff');
    expect(screen.getByPlaceholderText('Phone Number')).toHaveValue('919999988888');
  });
  await waitFor(() => {
    expect(screen.getAllByTestId('searchChip')[0].querySelector('span')).toHaveTextContent('Staff');
  });
  const [roles] = screen.getAllByTestId('autocomplete-element');
  roles.focus();
  fireEvent.keyDown(roles, { key: 'ArrowDown' });
  fireEvent.keyDown(roles, { key: 'ArrowDown' });
  fireEvent.keyDown(roles, { key: 'Enter' });

  await waitFor(() => {
    expect(screen.getAllByTestId('searchChip')[0].querySelector('span')).toHaveTextContent('Staff');
    expect(screen.getAllByTestId('searchChip')[1].querySelector('span')).toHaveTextContent(
      'Manager'
    );
  });

  fireEvent.click(screen.getByTestId('submitActionButton'));

  await waitFor(() => {
    expect(notificationSpy).toHaveBeenCalled();
  });
});

test('return error if roles api does not have data', async () => {
  render(
    <MockedProvider mocks={STAFF_MANAGEMENT_MOCKS_WITH_EMPTY_ROLES} addTypename={false}>
      <Router>
        <StaffManagement />
      </Router>
    </MockedProvider>
  );

  await waitFor(() => {
    expect(
      screen.getByText('An error occured! Not able to fetch collections or roles')
    ).toBeInTheDocument();
  });
});
